export interface storage {
  dataDir: string;
  write(object: Object, fileName: string): Promise<void>;
  read(objectName: string): Promise<string>;
}
