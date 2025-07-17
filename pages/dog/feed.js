export const runtime = 'experimental-edge';

const sampleFeed = [
  { id: 1, title: 'First Post', body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.' },
  { id: 2, title: 'Second Post', body: 'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.' },
  { id: 3, title: 'Third Post', body: 'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.' }
];

export default function DogFeed() {
  return (
    <main className="min-h-screen bg-brand/10 p-4">
      <h1 className="text-xl md:text-3xl font-bold mb-4 text-center">$DOG Feed</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sampleFeed.map(item => (
          <article key={item.id} className="bg-white rounded-xl shadow p-4 md:p-6 flex flex-col gap-2">
            <h2 className="font-semibold text-lg md:text-xl">{item.title}</h2>
            <p className="text-sm md:text-base leading-snug">{item.body}</p>
          </article>
        ))}
      </div>
    </main>
  );
}
