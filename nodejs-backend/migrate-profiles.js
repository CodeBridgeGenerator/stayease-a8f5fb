const app = require('./src/app');

(async () => {
  try {
    const usersService = app.service('users');
    const profilesService = app.service('profiles');
    const users = await usersService.find({ query: {} }); // All users
    let createdCount = 0;
    for (const user of users.data) {
      const existing = await profilesService.find({ query: { userId: user._id } });
      if (!existing.data.length) {
        await profilesService.create({
          userId: user._id,
          name: user.name,
          image: user.image || '',
          bio: '',
          preferences: {},
          homestays: [],
        });
        createdCount++;
        console.log(`Created profile for user ${user._id}`);
      }
    }
    console.log(`Migration complete. Profiles created: ${createdCount}`);
  } catch (err) {
    console.error('Migration error:', err);
  }
})(); 