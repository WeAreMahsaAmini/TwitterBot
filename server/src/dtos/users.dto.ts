import { IsString } from 'class-validator'

export class UserDto {
  @IsString()
  public id: string

  @IsString()
  public username: string

  @IsString()
  public name: string
}
