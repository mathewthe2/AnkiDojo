export default interface UserAppInterface {
  readonly id: string;
  readonly description: string;
  readonly icon: string;
  readonly title: string;
  readonly url: string;
  readonly anki_integration: boolean;
}
