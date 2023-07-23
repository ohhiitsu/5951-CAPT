import { toast } from "react-toastify";

// Mock window.alert to avoid console errors during tests
window.alert = jest.fn((message) => null);

  const handleUpload = (file, quantity, price) => {
    if (file === "") {
      alert("Please add the file");
      return;
    }

    if (isNaN(quantity) || quantity <= 0) {
      alert("Please enter a valid quantity");
      return;
    }

    if (isNaN(price) || !/^\d+(\.\d{1,2})?$/.test(price)) {
      alert("Please enter a valid price");
      return;
    }
    toast.success('File Uploaded!', { ...toastSettings });
  };

  const handleEditPrice = (productId, newPrice) => {
    if (isNaN(newPrice) || !/^\d+(\.\d{1,2})?$/.test(newPrice)) {
      alert("Please enter a valid price");
      return;
    } else {
        toast.success('Price updated!', { ...toastSettings });
    }
  };

  const handleEditQuantity = async (productId, newQuantity) => {
    if (!Number.isInteger(Number(newQuantity)) || newQuantity <= 0) {
      alert("Please enter a valid quantity");
      return;
    } else {
        toast.success('Quantity updated!', { ...toastSettings });
    }
  };

  const toastSettings = {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: false,
    draggable: true,
    progress: undefined,
    theme: "light",
  };

// Mocking the react-toastify functions
jest.mock("react-toastify", () => ({
  toast: {
    success: jest.fn(),
  },
}));

describe("handleUpload", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should show alert when file is empty", () => {
    const alertMock = jest.spyOn(window, "alert");
    handleUpload("", 10, 2.30);
    expect(alertMock).toHaveBeenCalledWith("Please add the file");
  });

  it("should show alert when quantity is not a valid number", () => {
    const alertMock = jest.spyOn(window, "alert");
    handleUpload("sampleFile.png", -10, 2.30);
    expect(alertMock).toHaveBeenCalledWith("Please enter a valid quantity");
  });

  it("should show alert when price is not a valid number", () => {
    const alertMock = jest.spyOn(window, "alert");
    handleUpload("sampleFile.png", 10, -10);
    expect(alertMock).toHaveBeenCalledWith("Please enter a valid price");
  });

  describe("handleEditPrice", () => {
    afterEach(() => {
      jest.clearAllMocks();
    });
  
    it("should show alert when new price is not a valid number", () => {
      const alertMock = jest.spyOn(window, "alert");
      handleEditPrice("product1", "invalidPrice");
      expect(alertMock).toHaveBeenCalledWith("Please enter a valid price");
    });
  
    it("should call toast.success with correct settings when price is updated", () => {
      // Mocking the toast success
      const toastMock = jest.fn();
      toast.success = toastMock;
  
      handleEditPrice("product1", "12.34");
  
      expect(toastMock).toHaveBeenCalledWith("Price updated!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
    });
  });

  describe("handleEditQuantity", () => {
    afterEach(() => {
      jest.clearAllMocks();
    });
  
    it("should show alert when new quantity is not a valid integer", () => {
      const alertMock = jest.spyOn(window, "alert");
      handleEditQuantity("product1", "invalidQuantity");
      expect(alertMock).toHaveBeenCalledWith("Please enter a valid quantity");
    });
  
    it("should call toast.success with correct settings when quantity is updated", () => {
      // Mocking the toast success
      const toastMock = jest.fn();
      toast.success = toastMock;
  
      handleEditQuantity("product1", "15");
  
      expect(toastMock).toHaveBeenCalledWith("Quantity updated!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
    });
  });
  
});
