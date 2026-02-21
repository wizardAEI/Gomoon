import { readFile } from 'fs/promises';
import { basename, join } from 'path';
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import pdf from 'pdf-parse';
import mammoth from 'mammoth';
import officeparser from 'officeparser';
import { csvParse } from 'd3-dsv';
import xlsx from 'xlsx';
import { app } from 'electron';
import moment from 'moment';
const appDataPath = app.getPath('userData');
const filesPath = join(appDataPath, 'file');
function processText(text) {
    // 多个换行变成一个换行
    text = text.replace(/\n+/g, '\n');
    // 去掉开头的换行
    text = text.replace(/^\n/, '');
    // 去掉结尾的换行
    text = text.replace(/\n$/, '');
    // 去掉开头的空格
    text = text.replace(/^\s+/, '');
    // 去掉结尾的空格
    text = text.replace(/\s+$/, '');
    return text;
}
async function parseTextFile(b) {
    return processText(b.toString('utf8'));
}
async function parsePDFFile(b) {
    const data = await pdf(b);
    return processText(data.text || '');
}
async function parseDocxFile(b) {
    const result = await mammoth.extractRawText({ buffer: b });
    return processText(result.value || '');
}
async function parsePPTXFile(b) {
    const text = await officeparser.parseOfficeAsync(b);
    return processText(text || '');
}
async function parseXLSXFile(b) {
    const arrayBuffer = new Uint8Array(b).buffer;
    const workbook = xlsx.read(arrayBuffer, { type: 'array' });
    let content = '';
    workbook.SheetNames.forEach((sheetName) => {
        const worksheet = workbook.Sheets[sheetName];
        content += xlsx.utils.sheet_to_csv(worksheet);
    });
    return processText(content);
}
async function parseJSONFile(b) {
    return processText(b.toString());
}
async function parseCSVFile(b) {
    const text = b.toString('utf8');
    const rows = csvParse(text);
    const content = rows
        .map((row) => Object.values(row).join(','))
        .join('\n');
    return processText(content);
}
export default async function parseFile(files) {
    let type = 'file';
    const today = moment().format('YYYY-MM-DD');
    const targetPath = join(filesPath, `/${today}`);
    const filename = moment().format('HH-mm-ss-') + basename(files[0].path);
    const targetFile = join(targetPath, filename);
    mkdirSync(targetPath, { recursive: true });
    if (files[0].data) {
        const base64Image = files[0].data.split(';base64,').pop();
        const imageBuffer = Buffer.from(base64Image, 'base64');
        writeFileSync(targetFile, imageBuffer);
    }
    else if (files[0].path) {
        copyFileSync(files[0].path, targetFile);
    }
    const file = await readFile(targetFile);
    const mimeType = files[0].type;
    let content = '';
    if (mimeType === 'text/plain' || mimeType === 'application/msword') {
        content = await parseTextFile(file);
    }
    else if (mimeType === 'application/pdf') {
        content = await parsePDFFile(file);
    }
    else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        content = await parseDocxFile(file);
    }
    else if (mimeType === 'application/vnd.openxmlformats-officedocument.presentationml.presentation') {
        content = await parsePPTXFile(file);
    }
    else if (mimeType === 'application/json') {
        content = await parseJSONFile(file);
    }
    else if (mimeType === 'text/csv') {
        content = await parseCSVFile(file);
    }
    else if (mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        mimeType === 'application/vnd.ms-excel') {
        content = await parseXLSXFile(file);
    }
    else if (mimeType.startsWith('image/')) {
        type = 'image';
        content = `data:${mimeType};base64,${file.toString('base64')}`;
    }
    else {
        content = readFileSync(targetFile, 'utf8');
    }
    return {
        type,
        content,
        src: targetPath,
        filename
    };
}
