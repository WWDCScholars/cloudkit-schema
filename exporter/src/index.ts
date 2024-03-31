import { CKEnvironment, PromisesApi } from '@apple/cktool.database'
import { createConfiguration } from '@apple/cktool.target.nodejs'
import fs from 'fs/promises'
import path from 'path'

const configuration = createConfiguration()

const api = new PromisesApi({
  configuration,
  security: {
    ManagementTokenAuth: process.env.CKTOOL_MGMT_TOKEN!
  }
})

// Reused parameters
const defaultParams = {
  teamId: process.env.TEAM_ID!,
  containerId: process.env.CONTAINER_ID!,
}

async function exportSchema(environment: CKEnvironment, filename: string) {
  console.log(`Downloading schema for ${environment}`)

  const destPath = path.join(__dirname, '..', '..', filename)
  
  try {
    const response = await api.exportSchema({
      ...defaultParams,
      environment
    })
    const arrayBuffer = await response.result.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    await fs.writeFile(destPath, buffer)
    console.log(`Schema downloaded to ${destPath}`)
  } catch (error) {
    console.error(configuration.jsonStringify(error, null, 2))
  }
}

const environment = process.argv[2]
switch (environment) {
  case 'development':
    exportSchema(CKEnvironment.DEVELOPMENT, 'schema-development.ckdb')
    break

  case 'production':
    exportSchema(CKEnvironment.PRODUCTION, 'schema-production.ckdb')
    break

  default:
    console.error(`Environment not recognized: ${environment}`)
    console.error('Valid environments are: development or production')
    break
}
