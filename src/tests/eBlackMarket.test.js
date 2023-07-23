const handleQuantityChange = (product, value) => {

    const newQuantity = product.quantity + value;
    const updatedQuantity = Math.max(1, Math.min(newQuantity, product.quantity));
    return updatedQuantity;
};

describe("handleQuantityChange", () => {

    it("decreases quantity", () => {
        const product = {
            id: 1,
            quantity: 10,
        };
        const newQuantity = handleQuantityChange(product, -5);
        expect(newQuantity).toBe(5);
    });

    it("limits quantity to one", () => {
        const product = {
            id: 1,
            quantity: 1,
        };
        const newQuantity = handleQuantityChange(product, -5);
        expect(newQuantity).toBe(1);
    });

    it("limits quantity to product quantity", () => {
        const product = {
            id: 1,
            quantity: 10,
        };
        const newQuantity = handleQuantityChange(product, 15);
        expect(newQuantity).toBe(10);
    });
});
