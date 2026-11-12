// Host coaching copy for the admin phone. Plain words for 10 to 15 year olds.
// Numbers match src/game/content.ts. These notes say what to teach and do. They never describe the big screen.
import type { SceneId } from '../game/types';

export interface Coach {
  say: string[];
  ask: string[];
  doubts: { q: string; a: string }[];
  watch: string[];
}

export const SCENE_COACH: Record<SceneId, Coach> = {
  welcome: {
    say: [
      'Bolt is the friendly guide. Techistan is a city full of ideas, and today the Startup Festival begins.',
      'The goal: build a startup in 5 steps and win the Golden Trophy.',
      'Jhootu is a naughty robot who tells lies and copies other people’s ideas. He wants every startup to copy him or sell to him.',
      'Honest, smart startups always beat him. That is the big message of the game.',
    ],
    ask: ['What would you build if you could start any business?', 'Why is cheating a bad way to win a race?'],
    doubts: [{ q: 'Is Jhootu real?', a: 'No, he is a robot character in the game. The lesson is real: copying and cheating hurt a business.' }],
    watch: ['Shy kids. Ask them to say one idea for their startup.'],
  },
  howto: {
    say: [
      'A startup has 3 meters: Customers, Happiness and Coins. Customers and Happiness stay between 0 and 50. Coins never go below 0.',
      'Success needs all three. Lots of coins alone is not enough, and customers need to stay happy.',
      'Success = (customers + happiness) x coins / 280, capped at 100. The stages are Tiny Stall, Busy Shop, Big Office and Sky Tower.',
      'Every question: the team talks, then the Lock Master locks its choice. Then the results are shown one team at a time.',
      'Some options are Jhootu tricks. They look great, but check what they cost in happiness.',
    ],
    ask: ['What is success if the team has 50 customers but 0 coins?', 'Why do unhappy customers walk away?'],
    doubts: [{ q: 'We have lots of customers, so why are we not winning?', a: 'Success multiplies customers and happiness by coins. Every meter counts.' }],
    watch: ['Teams that only chase coins, or only chase customers.'],
  },
  act1: {
    say: [
      'Every great startup starts with a real problem that people have.',
      'A good idea often starts with a wish: “I wish there was a way to…”. That is how a startup is born.',
      'Products are only useful if somebody needs them. Find out what people really want.',
      'Act 1 is about finding the problem. Ask people before you build.',
    ],
    ask: ['What is a problem you see every day?', 'Who could tell you what they really need?'],
    doubts: [{ q: 'Why not just guess what people want?', a: 'A guess can be wrong. Real people tell you what they need, and that saves coins later.' }],
    watch: ['Teams that want to build right away. Bring them back to the people they could ask.'],
  },
  act2: {
    say: [
      'Act 2 is about building version 1, so the product can be tested.',
      'Testing with 5 friends first costs 20 coins. It finds problems early, and it gives 5 extra seconds in Bug Smash.',
      'Copying Jhootu’s design is quick, but people spot the copy and stop trusting you.',
      'Bugs never really run out. New ones keep coming, so testing never fully ends. Bug Smash is where teams fight them.',
    ],
    ask: ['Why is it cheaper to find problems before launch?', 'What did the team learn from testing?'],
    doubts: [{ q: 'Is copying always bad?', a: 'Copying gets you caught fast. Build your own idea and people will trust you.' }],
    watch: ['Teams that add lots of features at once. Ask: which one do customers need first?'],
  },
  act3: {
    say: [
      'Act 3 is about launch: telling people about a product that works.',
      'A great product nobody knows about is like a party with no guests.',
      'Word of mouth is free, but only happy customers talk about you. Happiness of 20 or more gives the big boost.',
      'Step 3 of the Startup Recipe: tell Techistan about it!',
    ],
    ask: ['Why do happy customers tell their friends?', 'Why does a fake review cause trouble later?'],
    doubts: [{ q: 'Posters seem to work. Why not buy them?', a: 'Posters work, but they cost 20 coins. Free word of mouth is cheaper, if customers are happy enough to talk.' }],
    watch: ['Teams with low happiness who choose word of mouth. Ask how to make customers happier first.'],
  },
  act4: {
    say: [
      'Act 4 is about money. Customers are coming, so now the startup has to EARN money.',
      'Too expensive and people walk away. Too cheap and each sale earns almost nothing. Finding the middle is the trick.',
      'Investors offer coins, but they always want something back.',
      'Customers come to the market on foot. Keep the story going.',
    ],
    ask: ['What is profit?', 'What does an investor want back?'],
    doubts: [{ q: 'The biggest pile of coins is always best, right?', a: 'Not always. Coins help, but customers and happiness matter too.' }],
    watch: ['Teams that set a price below what it costs to make. Every sale loses money there.'],
  },
  act5: {
    say: [
      'Act 5 is about growing bigger. Startups that work well grow fast, and Techistan loves them.',
      'Jhootu is furious. He copies your products and sells them at half price.',
      'The Mayor has a huge order for the Festival. Pairs can share it fairly, or the deal can break.',
      'Step 5 of the Startup Recipe: grow bigger and stronger!',
    ],
    ask: ['Why does cutting your price not always help?', 'Why is a lie a bad way to fight back?'],
    doubts: [{ q: 'If we cut the price to half, don’t we win?', a: 'You may get more customers, but every sale earns half. Check the profit, not just the customer count.' }],
    watch: ['Teams that want to tell a lie about Jhootu’s copy. Explain why it always gets found out.'],
  },
  showday: {
    say: [
      'The Startup Festival is here, and the whole town came to watch.',
      'Each team tells its story on the big stage. A pitch has 45 seconds.',
      'Other teams give stars: 1 is a quiet clap, 5 is a standing ovation. Be fair. Real founders cheer each other on.',
      'Then the awards, and the Golden Trophy.',
    ],
    ask: ['What is the most important thing to say in a pitch?', 'Why is it good to cheer for other teams?'],
    doubts: [{ q: 'Can we give our own team stars?', a: 'No. Each team only gives stars to the other teams.' }],
    watch: ['Shy speakers. Clap first to give them courage.'],
  },
  finale: {
    say: [
      'Jhootu tried copying, cheating and tricking. But Techistan’s startups were smarter, kinder and more honest.',
      'He runs away shouting that he will be back next year. It is a joke, so enjoy it.',
      'Now the awards: who wins the Golden Trophy?',
    ],
    ask: ['Why did the honest startups win?', 'What is one thing you will do differently next time?'],
    doubts: [{ q: 'Did we win because we had the most coins?', a: 'Not only. The champion has the best Success score, so customers, happiness and coins all count.' }],
    watch: ['Kids who are sad they did not win. Praise one good move they made.'],
  },
};

/** Before the reveal: help the teams think, but never give the answer or name the trick. */
export const PRE_REVEAL: Coach = {
  say: ['Help the teams think, but do not give the answer.', 'Ask them: what does each choice cost in coins, and who does it help?'],
  ask: ['What is the best choice here, and why?', 'What could go wrong with the choice that looks easiest?'],
  doubts: [],
  watch: ['Teams that pick the first option without talking it through.'],
};
export const PRICE_PRE_REVEAL: Coach = {
  say: ['Help the teams work out the numbers. Do not tell them the best price.', 'Ask them: what does one sale cost to make, and what is left over after that?'],
  ask: ['What does one unit cost to make?', 'If the price is too high, who stops buying?'],
  doubts: [],
  watch: ['Teams that pick a price without checking it is above the cost.'],
};

/** Questions: the real topic and what each choice teaches. Costs are exact; meter changes are only described. */
export const QUESTION_COACH: Record<string, Coach> = {
  a1q1: {
    say: [
      'Asking 10 real people costs 10 coins. They tell you what they need, so happiness goes up a lot.',
      'Guessing at home is free, but you only half know what people need. Some customers come, not many are happy.',
      'Jhootu’s Secret Wish List costs 10 coins. It looks like a shortcut, but the list is fake, so people are unhappy.',
      'An idea box at school costs 20 coins and fills with ideas. New customers come and happiness goes up.',
    ],
    ask: ['Why is asking real people better than guessing?', 'What did Jhootu’s list promise? Was it true?'],
    doubts: [
      { q: 'Why spend coins if guessing is free?', a: 'Free is not always cheap. A wrong guess can cost lots of customers later.' },
      { q: 'Is the idea box better than asking 10 people?', a: 'Both can work. The idea box costs more coins but collects lots of ideas.' },
    ],
    watch: ['Teams that guess, then say they already know what people want.'],
  },
  a1q2: {
    say: [
      'Joining Jhootu gives 20 coins. But he bosses the team around all day, so happiness goes down a lot.',
      'Showing the notebook is free, but the spy-bot copies the idea and runs off. The copy takes customers.',
      'A strong box costs 10 coins. Ideas stay safe, customers trust you, and the team feels calm.',
      'Telling everyone first costs 20 coins. Flyers show who had the idea first, and lots of new customers come.',
    ],
    ask: ['Why is copying someone’s idea bad for the person who had it first?', 'How can you protect your ideas?'],
    doubts: [{ q: 'If Jhootu pays coins, isn’t that good?', a: 'Coins help, but being bossed around makes the team unhappy. Unhappy teams lose customers.' }],
    watch: ['Teams that show the notebook because the spy-bot looks friendly.'],
  },
  a2q1: {
    say: [
      'Testing with 5 friends costs 20 coins. They find problems before launch, customers are very happy, and the team gets 5 extra seconds in Bug Smash.',
      'Copying Jhootu’s design is free and brings customers, but people spot the copy and happiness goes down.',
      'Building super fast is free. Lots of customers come, but the product is wobbly, so happiness goes down a bit.',
      'Twenty features cost 20 coins. Customers are curious, but too many buttons confuse them.',
    ],
    ask: ['Why is it cheaper to find a problem before launch?', 'What does testing with friends teach you?'],
    doubts: [
      { q: 'Is building super fast a bad idea?', a: 'It gets customers quickly, but a wobbly product costs happiness. Test a little, then launch.' },
      { q: 'Do more features mean a better product?', a: 'Not always. Too many buttons confuse people.' },
    ],
    watch: ['Teams that copy Jhootu without thinking. Ask: what did you make yourself?'],
  },
  a3q1: {
    say: [
      'Posters cost 20 coins and reach everyone in Techistan. Lots of new customers come, but happiness does not change.',
      'Word of mouth is free. Happy customers tell their friends. If happiness is 20 or more, lots of customers come. If not, only a few.',
      'Fake 5-star reviews cost 10 coins and bring many customers. Then the newspaper finds out, everyone feels tricked, and happiness goes down a lot.',
      'Free samples at the school gate cost 40 coins. Kids try it first, new customers come, and happiness goes up.',
    ],
    ask: ['Why do happy customers spread the word?', 'Is it okay to buy fake reviews? Why not?'],
    doubts: [
      { q: 'Fake reviews brought lots of customers. Why is that bad?', a: 'Customers who feel tricked leave and stop trusting you. And the lie can be found out.' },
      { q: 'Why did word of mouth only bring a few customers for us?', a: 'Your happiness was below 20. Happy customers talk. Unhappy ones stay quiet.' },
    ],
    watch: ['Teams with low happiness choosing word of mouth. Tell them to fix happiness first.'],
  },
  a4q2: {
    say: [
      'The Kind Mentor gives 50 coins and good advice. The team feels supported, so happiness goes up a little.',
      'Jhootu Ventures gives 120 coins, the most. But he sells the customers’ secrets: customers and happiness both go down.',
      'The Pushy Boss gives 100 coins but wants results right now. The team is stressed, so happiness goes down.',
      'The Mama-Mami Fund gives 30 coins and tells the whole family. A few new customers come.',
    ],
    ask: ['What did each investor want back?', 'Why is the biggest pile of coins not always the best?'],
    doubts: [
      { q: '120 coins is more than 50. Why not pick Jhootu?', a: 'He takes customers and happiness. Losing those hurts success more than the extra coins help.' },
    ],
    watch: ['Teams that pick the biggest number without reading what it costs.'],
  },
  a5q1: {
    say: [
      'Loyalty cards cost 20 coins. Old customers feel special and stay, so customers and happiness go up.',
      'Cutting your price is free and brings customers. But each sale earns less, so happiness goes down a little.',
      'Calling his copy dangerous is a lie. It brings customers for a moment, but people find out and happiness goes down a lot.',
      'Making your product better costs 40 coins. Customers love it: happiness goes up a lot and a few more customers come.',
    ],
    ask: ['Why does a lie hurt more than it helps?', 'If you cut the price, what happens to each sale?'],
    doubts: [
      { q: 'Cutting the price brings more customers. Isn’t that a win?', a: 'More customers, but each sale makes less money. Check the profit, not just the customers.' },
      { q: 'Is it bad to be a little tricky?', a: 'A lie gets found out. Honest teams keep their customers.' },
    ],
    watch: ['Teams that choose the lie. Ask what happens when people find out.'],
  },
};

/** Price It Right (act 4). */
export const PRICE_COACH: Coach = {
  say: [
    'Ten interested people look at the product. A low price sells to all ten. A price that is too high sells to none.',
    'Profit on one sale = price minus the cost to make one unit. Total profit = people who buy x profit per sale.',
    'The best price earns 80 coins. Other prices earn a share of that, in proportion to their profit.',
    'Customers gained = people who buy, minus 4. Fair prices make people happier. Very greedy prices annoy them.',
  ],
  ask: ['What does profit mean?', 'Why can a higher price still earn less?', 'If the price is below the cost, what happens on each sale?'],
  doubts: [
    { q: 'If I sell to everyone, don’t I earn the most?', a: 'Not if each sale only earns a little. Total profit = buyers x profit per sale.' },
    { q: 'Why not pick the biggest price?', a: 'If nobody buys, the profit is zero.' },
  ],
  watch: ['Teams that guess. Ask: what does one unit cost to make? What is the profit at this price?'],
};

/** Mega Order (act 5). */
export const MEGA_COACH: Coach = {
  say: [
    'Teams are paired: the strongest with the weakest, so comebacks are possible.',
    'Share equally: 10 customers and 50 coins each, and happiness goes up by 5.',
    'One team takes more (14 customers and 70 coins), the other takes less (6 and 30). It only works if they agree on who gets more.',
    'If either team says no deal, each team gets 3 customers and no shared order. Choices that do not fit together break the deal: each team loses 3 happiness.',
    'An odd number of teams: the team with no partner gets its own mini order: 10 customers and 50 coins.',
  ],
  ask: ['Why is a fair share good for both teams?', 'What happens when a deal breaks?'],
  doubts: [
    { q: 'Why not take the most for ourselves?', a: 'If both push for more, the deal breaks and both lose happiness.' },
    { q: 'What if we have no partner?', a: 'You get your own mini order. It is a fair deal.' },
  ],
  watch: ['Pairs that do not talk. Remind them they have a 5-minute pair talk.'],
};

/** Mic Time: the topic per act and the question Bolt asks when a team has no special story. */
export const MIC_TOPIC: Record<number, string> = {
  1: 'Why asking real people beats guessing',
  3: 'Why fake reviews are not okay',
  4: 'What profit is, and how to work it out',
};
export const MIC_ASK: Record<number, string> = {
  1: 'Why is asking real people better than guessing?',
  3: 'Is it okay to buy fake reviews? Why not?',
  4: 'A product sells for ₹50 and costs ₹30 to make. How much profit is made on each sale? What does profit mean?',
};
