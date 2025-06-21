
import { faker } from "@faker-js/faker";
export default (user,count,providerIdIds) => {
    let data = [];
    for (let i = 0; i < count; i++) {
        const fake = {
providerId: providerIdIds[i % providerIdIds.length],
category: faker.lorem.sentence(1),
name: faker.lorem.sentence(1),
description: faker.lorem.sentence(1),
priceRange: faker.lorem.sentence(1),
location: faker.lorem.sentence(1),
whatsappLink: faker.lorem.sentence(1),
imageUrl: faker.lorem.sentence(1),

updatedBy: user._id,
createdBy: user._id
        };
        data = [...data, fake];
    }
    return data;
};
