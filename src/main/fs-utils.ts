import fs from 'fs';
import path from 'path';

export const PARTITION_ID_FILE = '__catalog_id-do_not_remove__.txt';

export const removePartitionLetter = (fullPath: string) => fullPath.replace(/^[a-zA-Z]:[/\\]+/, '');

const getIdPath = (partitionPath: string) =>
  path.join(partitionPath.replace(/[:\\/]+/g, ':'), PARTITION_ID_FILE);

export const readPartitionLabel = (partitionPath: string) => {
  const filePath = getIdPath(partitionPath);
  if (fs.existsSync(filePath)) {
    return fs.readFileSync(filePath, 'utf8');
  }
  return '';
};

export const writePartitionLabel = (partitionPath: string, alias: string = '') => {
  const filePath = getIdPath(partitionPath);
  if (alias && !fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, alias, 'utf8');
  }
};
