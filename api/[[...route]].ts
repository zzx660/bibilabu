import { handle } from 'hono/vercel'
import app from '../serverless/hono/index'

export const config = {
  runtime: 'edge'
}

export default handle(app)
