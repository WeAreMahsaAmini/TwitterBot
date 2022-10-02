import App from '@/app'
import { IndexController } from '@controllers/index.controller'
import { OAuthController } from '@controllers/oauth.controller'
import validateEnv from '@utils/validateEnv'

validateEnv()

const app = new App([OAuthController, IndexController])
app.listen()
