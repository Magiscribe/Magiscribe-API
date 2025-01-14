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

function parseConditionText(text: string): Array<{ to: string; condition: string }> {
  if (!text) return [];

  // Remove any leading/trailing whitespace
  text = text.trim();

  // Pattern 1: Basic if/otherwise with node references
  const basicPattern = /If (.*?), (?:go to|route to) (?:node )?(\w+)\. Otherwise(?:,)? (?:go to|route to) (?:node )?(\w+)/i;
  
  // Pattern 2: Node references with numbers in quotes
  const quotedNumberPattern = /If (.*?), (?:go to|route to) (?:node )?"(\w+)"\. Otherwise(?:,)? (?:go to|route to) (?:node )?"(\w+)"/i;
  
  // Pattern 3: Complex conditions with OR/AND
  const complexPattern = /If (.*?) (?:go to|route to) (?:node )?(\w+)(?:\s+OR\s+.*?(?:go to|route to) (?:node )?(\w+))?(?:\s+AND\s+.*?(?:go to|route to) (?:node )?(\w+))?/i;
  
  // Pattern 4: Questions count based routing
  const questionsCountPattern = /If the total questions asked is (less than|at least|[0-9]+) .*?(?:go to|route to) '(\w+)'/i;
  
  // Pattern 5: Response-based conditions
  const responsePattern = /If the user (?:answers?|selected) ['"]?(.*?)['"]? (?:in (?:node|the) )?(\w+)?,? (?:go to|route to) (?:node )?(\w+)/i;
  
  // Pattern 6: Feature selection pattern
  const featurePattern = /If ['"]?(.*?)['"]? is selected in node (\w+), (?:go to|route to) (?:node )?(\w+)\. Otherwise(?:,)? (?:go to|route to) (?:node )?(\w+)/i;
  
  // Try each pattern in sequence
  let matches;
  let conditions: any[] = [];

  if (matches = text.match(basicPattern)) {
    const [, condition, trueRoute, falseRoute] = matches;
    conditions = [
      { to: trueRoute, condition: `If ${condition}, route to` },
      { to: falseRoute, condition: 'Otherwise, route to' }
    ];
  }
  else if (matches = text.match(quotedNumberPattern)) {
    const [, condition, trueRoute, falseRoute] = matches;
    conditions = [
      { to: trueRoute, condition: `If ${condition}, route to` },
      { to: falseRoute, condition: 'Otherwise, route to' }
    ];
  }
  else if (matches = text.match(complexPattern)) {
    const [, condition, route1, route2, route3] = matches;
    conditions.push({ to: route1, condition: `If ${condition}, route to` });
    if (route2) conditions.push({ to: route2, condition: 'OR route to' });
    if (route3) conditions.push({ to: route3, condition: 'AND route to' });
  }
  else if (matches = text.match(questionsCountPattern)) {
    const [, countCondition, route] = matches;
    conditions.push({ 
      to: route, 
      condition: `If total questions ${countCondition}, route to`
    });
  }
  else if (matches = text.match(responsePattern)) {
    const [, response, nodeRef, route] = matches;
    conditions.push({ 
      to: route, 
      condition: `If user answers "${response}"${nodeRef ? ` in node ${nodeRef}` : ''}, route to`
    });
  }
  else if (matches = text.match(featurePattern)) {
    const [, feature, nodeRef, trueRoute, falseRoute] = matches;
    conditions = [
      { to: trueRoute, condition: `If "${feature}" selected in node ${nodeRef}, route to` },
      { to: falseRoute, condition: 'Otherwise, route to' }
    ];
  }

  // Special cases
  if (text.includes('warrants a follow up question') || text.includes('warrants a direct response')) {
    const followupMatch = text.match(/go to (\w+)/);
    if (followupMatch) {
      conditions.push({ 
        to: followupMatch[1], 
        condition: 'If response warrants follow-up, route to'
      });
    }
  }

  if (text.includes('end the conversation')) {
    const endMatch = text.match(/(?:go to|route to) (?:node )?(\w+)/);
    if (endMatch) {
      conditions.push({ 
        to: endMatch[1], 
        condition: 'If conversation should end, route to'
      });
    }
  }

  return conditions;
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
            const conditions = parseConditionText(node.data.text);
            if (conditions.length > 0) {
              node.data = { conditions };
              modified = true;
            }
          }
        });
      });

      if (modified) {
        await Inquiry.updateOne({ _id: inquiry._id }, inquiry);
        log.info(`Migrated inquiry ${inquiry._id}`);
      }
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
