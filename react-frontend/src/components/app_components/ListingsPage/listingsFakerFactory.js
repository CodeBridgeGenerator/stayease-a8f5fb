
import { faker } from "@faker-js/faker";
export default (user,count,providerIdIds) => {
    let data = [];
    for (let i = 0; i < count; i++) {
        const fake = {
providerId: providerIdIds[i % providerIdIds.length],
category: faker.lorem.sentence(""),
name: faker.lorem.sentence(""),
description: faker.lorem.sentence(""),
priceRange: faker.lorem.sentence(""),
location: faker.lorem.sentence(""),
whatsappLink: faker.lorem.sentence(""),
imageUrl: faker.lorem.sentence(""),

updatedBy: user._id,
createdBy: user._id
        };
        data = [...data, fake];
    }
    return data;
};
