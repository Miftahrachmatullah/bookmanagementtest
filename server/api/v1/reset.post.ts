import { db } from '../../utils/db'

export default defineEventHandler(async (event) => {
  await db.reset()
  return { message: 'Database reset successfully.' }
})
