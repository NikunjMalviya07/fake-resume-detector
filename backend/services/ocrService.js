import axios from 'axios';
import FormData from 'form-data';

const OCR_SERVICE_URL = process.env.OCR_SERVICE_URL;

export async function extractTextFromResume(fileBuffer, filename) {
  const formData = new FormData();
  formData.append('file', fileBuffer, filename);

  const response = await axios.post(
    `${OCR_SERVICE_URL}/extract-text`,
    formData,
    { headers: formData.getHeaders() }
  );

  return response.data.extracted_text;
}