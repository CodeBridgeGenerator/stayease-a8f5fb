
import { faker } from "@faker-js/faker";
export default (user,count,bookingIdIds,customerIdIds,providerIdIds) => {
    let data = [];
    for (let i = 0; i < count; i++) {
        const fake = {
bookingId: bookingIdIds[i % bookingIdIds.length],
customerId: customerIdIds[i % customerIdIds.length],
providerId: providerIdIds[i % providerIdIds.length],
rating: faker.lorem.sentence(""),
comment: faker.lorem.sentence(""),

updatedBy: user._id,
createdBy: user._id
        };
        data = [...data, fake];
    }
    return data;
};
