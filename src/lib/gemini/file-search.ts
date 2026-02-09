import { getGeminiClient } from '@/lib/gemini/client';
import {
  getUserProfile,
  saveCorpusDocument,
  getCorpusDocuments,
  deleteCorpusDocument,
} from '@/lib/firebase/firestore';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { CorpusDocument } from '@/types';

/**
 * Generates a unique document ID based on uid and timestamp.
 */
function generateDocId(uid: string): string {
  return `${uid}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Gets or creates a user's corpus for RAG file search.
 *
 * Since `client.corpora` may not exist in @google/genai v1.40.0,
 * this uses `client.files.upload()` as the storage mechanism and
 * tracks file URIs in Firestore as the corpus.
 *
 * Returns the corpus name (a logical identifier stored on the user profile).
 */
export async function getOrCreateUserCorpus(uid: string): Promise<string> {
  const profile = await getUserProfile(uid);

  if (profile?.corpusName) {
    return profile.corpusName;
  }

  // Create a logical corpus name for this user
  const corpusName = `corpus-${uid}`;

  // Store the corpus name on the user profile
  await updateDoc(doc(db, 'users', uid), { corpusName });

  return corpusName;
}

/**
 * Uploads content as a file to Gemini and tracks it in Firestore.
 *
 * Uses the Gemini Files API (`client.files.upload()`) to store the document,
 * then records the file reference in the user's Firestore corpus subcollection.
 */
export async function addDocumentToCorpus(
  corpusName: string,
  uid: string,
  content: string,
  metadata: { title: string; source: string }
): Promise<CorpusDocument> {
  const client = getGeminiClient();
  const docId = generateDocId(uid);

  // Upload content as a file via the Gemini Files API
  const contentBlob = new Blob([content], { type: 'text/plain' });
  const uploadResult = await client.files.upload({
    file: contentBlob,
    config: {
      displayName: `${metadata.title} (${metadata.source})`,
      mimeType: 'text/plain',
    },
  });

  if (!uploadResult.name) {
    throw new Error('File upload to Gemini failed: no file name returned');
  }

  const corpusDocument: CorpusDocument = {
    id: docId,
    documentName: uploadResult.name,
    source: metadata.source,
    title: metadata.title,
    uploadedAt: Date.now(),
    sizeBytes: new TextEncoder().encode(content).byteLength,
    approved: true,
  };

  // Track in Firestore under the user's corpus subcollection
  await saveCorpusDocument(uid, corpusDocument);

  // Log for debugging
  console.log(
    `[FileSearch] Added document "${metadata.title}" to ${corpusName} (file: ${uploadResult.name})`
  );

  return corpusDocument;
}

/**
 * Removes a document from both Gemini Files API and Firestore.
 */
export async function removeDocumentFromCorpus(
  _corpusName: string,
  documentName: string,
  uid: string,
  docId: string
): Promise<void> {
  const client = getGeminiClient();

  // Delete from Gemini Files API
  try {
    await client.files.delete({ name: documentName });
    console.log(`[FileSearch] Deleted Gemini file: ${documentName}`);
  } catch (error) {
    // Log but continue with Firestore cleanup even if Gemini delete fails
    // (the file may have already expired or been deleted)
    console.warn(
      `[FileSearch] Failed to delete Gemini file ${documentName}:`,
      error instanceof Error ? error.message : error
    );
  }

  // Remove from Firestore
  await deleteCorpusDocument(uid, docId);
}

/**
 * Deletes an entire user corpus: removes all files from Gemini and
 * cleans up the Firestore corpus subcollection and user profile field.
 */
export async function deleteUserCorpus(
  _corpusName: string,
  uid: string
): Promise<void> {
  const client = getGeminiClient();

  // Get all documents in the corpus from Firestore
  const documents = await getCorpusDocuments(uid);

  // Delete each file from Gemini
  for (const corpusDoc of documents) {
    try {
      await client.files.delete({ name: corpusDoc.documentName });
    } catch (error) {
      console.warn(
        `[FileSearch] Failed to delete Gemini file ${corpusDoc.documentName}:`,
        error instanceof Error ? error.message : error
      );
    }
  }

  // Delete all Firestore corpus documents
  for (const corpusDoc of documents) {
    await deleteCorpusDocument(uid, corpusDoc.id);
  }

  // Clear the corpus name from the user profile
  await updateDoc(doc(db, 'users', uid), { corpusName: null });

  console.log(
    `[FileSearch] Deleted corpus for user ${uid} (${documents.length} documents removed)`
  );
}

/**
 * Lists all documents in a user's corpus from Firestore.
 */
export async function listUserDocuments(uid: string): Promise<CorpusDocument[]> {
  return getCorpusDocuments(uid);
}
