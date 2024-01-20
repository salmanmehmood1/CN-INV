const express = require("express");
const router = express.Router();
const supplierController = require("../controller/supplierController");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.get("/getAllSupplier", supplierController.getAllSupplier);
router.post(
  "/addSupplier",
  upload.single("profile"),
  supplierController.addSupplier
);
router.put(
  "/editSupplier",
  upload.single("profile"),
  supplierController.editSupplier
);
router.post("/getSupplierByID", supplierController.getSupplierByID);
router.get("/getAllVendorsName", supplierController.getAllVendorsName);
router.post("/CheckVendNameExist", supplierController.CheckVendNameExist);

module.exports = router;
