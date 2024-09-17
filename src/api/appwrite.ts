import { Account, Client, Databases, Query } from "appwrite"
import { errorResponse } from "./errorResponses"

const hostname = import.meta.env.VITE_HOSTNAME
const endpoint = import.meta.env.VITE_APPWRITE_ENDPOINT
const projectId = import.meta.env.VITE_APPWRITE_PROJECT_ID
const dbId = import.meta.env.VITE_APPWRITE_DB_ID
const dbReviews = import.meta.env.VITE_APPWRITE_DB_REVIEWS_ID
const dbCidades = import.meta.env.VITE_APPWRITE_DB_CIDADES_ID
const dbUsuarios = import.meta.env.VITE_APPWRITE_DB_USUARIOS_ID

const client = new Client().setEndpoint(endpoint).setProject(projectId)
const account = new Account(client)
const databases = new Databases(client)

/***/

export const buscarCidadeEReviews = async (cidadeId: number): Promise<{ cidade?: any, reviews: any[] }> => {
  try {
    const cidade = await databases.getDocument(dbId, dbCidades, cidadeId.toString());
    const reviews: any[] = cidade ? (await databases.listDocuments(dbId, 'reviews', [Query.equal("cidades", [cidade.$id])])).documents : [];
    return { cidade, reviews };
  } catch (error) {
    console.error("Erro ao buscar cidade e reviews:", error);
    return { cidade: undefined, reviews: [] };
  }
};