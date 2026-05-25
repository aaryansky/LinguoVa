// ── Reading passages per language ──
const readingByLang = {
  Japanese: [
    { passage: '田中さんは毎日学校へ行きます。日本語と数学を勉強します。好きな科目は美術です。', translation: 'Tanaka-san goes to school every day. He studies Japanese and Math. His favourite subject is Art.', q: 'Reading Comprehension', sentence: 'What is Tanaka\'s favourite subject?', options: ['Japanese','Maths','Art','Science'], answer: 2 },
    { passage: 'ゆきさんは毎朝ジョギングをします。そのあとシャワーを浴びて、朝ごはんを食べます。', translation: 'Yuki-san goes jogging every morning. After that, she takes a shower and eats breakfast.', q: 'Reading Comprehension', sentence: 'What does Yuki do every morning?', options: ['Cycling','Jogging','Swimming','Yoga'], answer: 1 },
  ],
  French: [
    { passage: 'Marie est médecin. Elle travaille à l\'hôpital de Paris. Elle aime beaucoup son travail.', translation: 'Marie is a doctor. She works at the Paris hospital. She loves her job very much.', q: 'Reading Comprehension', sentence: 'Where does Marie work?', options: ['At a school','At a hospital','At a restaurant','At home'], answer: 1 },
    { passage: 'Pierre va à la boulangerie chaque matin. Il achète du pain et des croissants pour sa famille.', translation: 'Pierre goes to the bakery every morning. He buys bread and croissants for his family.', q: 'Reading Comprehension', sentence: 'What does Pierre buy?', options: ['Milk and cheese','Bread and croissants','Coffee and cake','Fruit and vegetables'], answer: 1 },
  ],
  Spanish: [
    { passage: 'Carlos estudia español en la universidad. Le gusta mucho aprender idiomas nuevos.', translation: 'Carlos studies Spanish at the university. He really likes learning new languages.', q: 'Reading Comprehension', sentence: 'What is Carlos studying?', options: ['English','French','Spanish','German'], answer: 2 },
  ],
  German: [
    { passage: 'Am Wochenende geht Anna gern in den Park. Sie liest Bücher und hört Musik.', translation: 'On weekends, Anna likes to go to the park. She reads books and listens to music.', q: 'Reading Comprehension', sentence: 'What does Anna do on weekends?', options: ['Goes shopping','Visits friends','Goes to the park','Goes to the cinema'], answer: 2 },
  ],
  Italian: [
    { passage: 'Luca abita a Roma con la sua famiglia. Lavora in un ristorante vicino al Colosseo.', translation: 'Luca lives in Rome with his family. He works in a restaurant near the Colosseum.', q: 'Reading Comprehension', sentence: 'Where does Luca live?', options: ['Milan','Naples','Florence','Rome'], answer: 3 },
  ],
  Hindi: [
    { passage: 'प्रिया को पढ़ना बहुत पसंद है। वो हर रोज़ एक घंटा किताब पढ़ती है。', translation: 'Priya loves to read. She reads a book for an hour every day.', q: 'Reading Comprehension', sentence: 'What does Priya like?', options: ['Cooking','Dancing','Reading','Singing'], answer: 2 },
  ],
};
