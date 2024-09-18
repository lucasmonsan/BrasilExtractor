import { Account, Client, Databases, Query } from "appwrite"

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