
import { faker } from "@faker-js/faker";
export default (user,count,listingIdIds,customerIdIds,providerIdIds) => {
    let data = [];
    for (let i = 0; i < count; i++) {
        const fake = {
listingId: listingIdIds[i % listingIdIds.length],
customerId: customerIdIds[i % customerIdIds.length],
providerId: providerIdIds[i % providerIdIds.length],
bookingDate: faker.lorem.sentence(""),
status: faker.lorem.sentence(""),
notes: faker.lorem.sentence(""),

updatedBy: user._id,
createdBy: user._id
        };
        data = [...data, fake];
    }
    return data;
};
