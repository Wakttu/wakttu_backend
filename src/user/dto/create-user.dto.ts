export class CreateUserDto {
  id: string;
  name: string;
  image: string;
  provider: string;
  password: string | undefined;
}
