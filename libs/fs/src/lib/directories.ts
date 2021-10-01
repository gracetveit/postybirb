import { app } from 'electron';
import { join } from 'path';
import { ensureDirSync } from './fs';

const IS_TEST_DIRECTORY = process.env.NODE_ENV === 'Test';

const DOCUMENTS_DIRECTORY = IS_TEST_DIRECTORY
  ? join('./', 'test')
  : app.getPath('documents');
const POSTYBIRB_DIRECTORY = join(DOCUMENTS_DIRECTORY, 'PostyBirb');
const DATA_DIRECTORY = join(POSTYBIRB_DIRECTORY, 'data');
const WEBSITE_DATA_DIRECTORY = join(DATA_DIRECTORY, 'website-data');

function initializeDirectories() {
  ensureDirSync(DATA_DIRECTORY);
  ensureDirSync(WEBSITE_DATA_DIRECTORY);
}

export {
  POSTYBIRB_DIRECTORY,
  DATA_DIRECTORY,
  WEBSITE_DATA_DIRECTORY,
  initializeDirectories,
};
