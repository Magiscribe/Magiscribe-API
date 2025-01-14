import { Inquiry } from '@/database/models/inquiry';
import database from '../src/database';
import log from '../src/log';

interface Node {
  id: string;
  type: string;
  data: {
    text?: string;
    conditions?: Array<{
      to: string;
      condition: string;
    }>;
  };
}

async function migrateInquiries() {
  try {
    await database.init();
    log.info('Connected to database');

    const inquiries = await Inquiry.find({});
    log.info(`Found ${inquiries.length} inquiries to migrate`);

    for (const inquiry of inquiries) {
      let modified = false;

      // Migrate both main graph and draft graph
      ['graph', 'draftGraph'].forEach((graphKey) => {
        if (!inquiry.data[graphKey]) return;

        const nodes = inquiry.data[graphKey].nodes;
        if (!Array.isArray(nodes)) return;

        nodes.forEach((node: Node) => {
          if (node.type === 'condition' && node.data?.text) {
            console.log(node.data.text);
          }
        });
      });
    }

    log.info('Migration completed successfully');
  } catch (error) {
    log.error('Migration failed:', error);
    throw error;
  }
}

(async () => {
  try {
    await migrateInquiries();
    process.exit(0);
  } catch (error) {
    process.exit(1);
  }
})();
