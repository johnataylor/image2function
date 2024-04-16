
import { createTextFromPng } from './imageProcessing.js';

const pngFileName = 'C:\\data\\cache\\page10.png';
const txtFileName = '.\\desc10.txt';

await createTextFromPng(pngFileName, txtFileName);
