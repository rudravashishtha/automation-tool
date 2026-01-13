import Cryptor from "cryptr";

const cryptor = new Cryptor(process.env.ENCRYPTION_KEY!);

export const encrypt = (text: string) => {
  return cryptor.encrypt(text);
};

export const decrypt = (encryptedText: string) => {
  return cryptor.decrypt(encryptedText);
};
