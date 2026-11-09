import dotenv from 'dotenv';
dotenv.config();
import axios from 'axios';

// --- Edit this for whichever user you want to check ---
const USERNAME = 'prabhat-Git01';
// ---------------------------------------------------------

const github = axios.create({
  baseURL: 'https://api.github.com',
  headers: {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {})
  }
});

async function listAllCommits() {
  console.log(`Searching all public commits authored by "${USERNAME}" across GitHub...\n`);

  try {
    const { data } = await github.get('/search/commits', {
      params: { q: `author:${USERNAME}`, sort: 'author-date', order: 'desc', per_page: 100 }
    });

    console.log(`Total commits found: ${data.total_count}\n`);

    data.items.forEach((item, i) => {
      console.log(`${i + 1}. ${item.repository.full_name} — ${item.commit.message.split('\n')[0]}`);
      console.log(`   SHA: ${item.sha.slice(0, 7)}`);
      console.log(`   Date: ${item.commit.author.date}`);
      console.log(`   URL: ${item.html_url}\n`);
    });

    if (data.total_count > data.items.length) {
      console.log(`(Showing first ${data.items.length} of ${data.total_count} total — GitHub's search API caps results per page.)`);
    }
  } catch (error) {
    console.error('Error:', error.response?.data?.message || error.message);
  }
}

listAllCommits();