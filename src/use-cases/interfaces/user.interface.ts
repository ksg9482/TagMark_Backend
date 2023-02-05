import { User } from "src/frameworks/data-services/postgresql/model";

export interface SocialUserForm extends Pick<User, 'email' | 'password' | 'type' | 'role'> { };


