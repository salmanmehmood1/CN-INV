const db = require("../connection/connection");

const getAllSalesByID = (req, res) => {
  // console.log(req.body)
  const { store_id, est_sale } = req.body;
  const sql =
    "select distinct SO.so_id,coalesce(concat(SO.est_sale, SO.so_id), '-') as 'Q-S #', DATE_FORMAT(SO.est_date, '%m/%d/%Y %l:%i:%s %p') as 'Quote Date', SO.customer_po_no as 'Customer PO', s.name as 'Status'," +
    "DATE_FORMAT(SO.sale_date, '%m/%d/%Y %l:%i:%s %p') as 'Sale Date', c.name as 'Customer', SO.total, SO.amount_pending from inv.sale_orders SO left outer join inv.customers c" +
    " on SO.customer_id = c.customer_id left outer join inv.sale_order_status s on SO.status_id = s.status_id left outer join inv.sale_order_products sop on SO.so_id=sop.so_id " +
    "left outer join inv.inventories i on i.product_id=sop.product_id left outer join inv.stores ss on i.store_id=ss.store_id " +
    "where ss.store_id = ? and SO.est_sale = ? order by SO.so_id desc;";
  db.query(sql, [store_id, est_sale], (err, result) => {
    if (err) {
      console.error("Database insertion error:", err);
      return res.status(500).json({ error: "Failed to fetch records" });
    }
    console.log("Get All Sales By Store ID");
    console.log(result);
    return res.status(200).json(result);
  });
};

const getSaleOrderDetailsByID = (req, res) => {
  const { so_id } = req.body;
  const sql =
    "select p.product_id, p.code, p.name as product_name, p.unit_price,pi.image,p.details, COALESCE(sop.quantity,0) as quantity, sop.discount, COALESCE(ss.product_shipped,0) as product_shipped " +
    "from inv.sale_orders so left outer join inv.sale_order_products sop on so.so_id = sop.so_id " +
    "left outer join inv.products p on sop.product_id = p.product_id " +
    "left outer join (select distinct sum(quantity_shipped) as product_shipped, product_id,so_id from inv.shipments group by  " +
    "product_id, so_id) as ss on ss.product_id = sop.product_id and ss.so_id = sop.so_id  " +
    "left outer join inv.product_images pi on sop.product_id = pi.product_id " +
    "where so.so_id = ? and (pi.image_id = (select min(k.image_id) from inv.product_images k where k.product_id = sop.product_id and sop.product_id is not null) or pi.image_id is null); ";
  db.query(sql, [so_id], (err, result) => {
    if (err) {
      console.error("Database insertion error:", err);
      return res.status(500).json({ error: "Failed to fetch records" });
    }

    const productsWithImages = result.map((product) => {
      return {
        ...product,
        image: product.image ? product.image.toString("base64") : null,
      };
    });
    console.log("Get Sale Order Details by ID");
    // console.log(result)
    return res.status(200).json(productsWithImages);
  });
};

const getSaleOrderCustomerByID = (req, res) => {
  const { so_id } = req.body;
  const sql =
    "select c.customer_id, c.name, s.customer_po_no, s.project_name, s.status_id, s.ship_method, s.tracking_no,i.shipment, i.tax,s.so_note, i.invoice_id from " +
    "inv.sale_orders s left outer join inv.customers c on s.customer_id = c.customer_id left outer join inv.invoices i on s.so_id = i.so_id " +
    "where s.so_id = ?;";
  db.query(sql, [so_id], (err, result) => {
    if (err) {
      console.error("Database insertion error:", err);
      return res.status(500).json({ error: "Failed to fetch records" });
    }
    console.log("Get Sale Order Customer Details by ID");
    // console.log(result)
    return res.status(200).json(result);
  });
};

const getCustomerByID = (req, res) => {
  const { customer_id } = req.body;
  // console.log(customer_id)
  const sql =
    "select customer_id, name, phone, contact_phone, contact_email from inv.customers where customer_id = ?;";
  db.query(sql, [customer_id], (err, result) => {
    if (err) {
      console.error("Database insertion error:", err);
      return res.status(500).json({ error: "Failed to fetch records" });
    }
    console.log("Get Customer Details by ID");
    // console.log(result);
    return res.status(200).json(result);
  });
};

const addSaleOrder = (req, res) => {
  const jsonData = JSON.stringify(req.body);
  console.log(jsonData);
  const sql = "CALL inv.sp_add_sale_order(?);";
  db.query(sql, [jsonData], (err, result) => {
    if (err) {
      console.error("Database insertion error:", err);
      return res.status(500).json({ error: "Failed to Create Sale Order" });
    }
    console.log("Sale order Created successfully");
    console.log(result);
    return res.status(200).json(result);
  });
};

const deleteEditSaleOrderProduct = (req, res) => {
  const jsonData = JSON.stringify(req.body);
  console.log(jsonData);
  const sql = "CALL inv.sp_delete_sale_order_edit_product(?);";
  db.query(sql, [jsonData], (err, result) => {
    if (err) {
      console.error("Database insertion error:", err);
      return res
        .status(500)
        .json({ error: "Failed to Delete product from Edit Sale Order" });
    }
    console.log("Product deleted from Sale order successfully");
    return res
      .status(200)
      .json({ message: "Product deleted from Sale order successfully" });
  });
};

const EditSaleOrder = (req, res) => {
  const jsonData = JSON.stringify(req.body);
  console.log(jsonData);
  const sql = "CALL inv.sp_edit_sale_order(?);";
  db.query(sql, [jsonData], (err, result) => {
    if (err) {
      console.error("Database insertion error:", err);
      return res.status(500).json({ error: "Failed to Update Sale Order" });
    }
    console.log("Sale order Updated successfully");
    return res.status(200).json({ message: "Sale order Updated successfully" });
  });
};

const EditEstimation = (req, res) => {
  const jsonData = JSON.stringify(req.body);
  console.log(jsonData);
  const sql = "CALL inv.sp_edit_estimation(?);";
  db.query(sql, [jsonData], (err, result) => {
    if (err) {
      console.error("Database insertion error:", err);
      return res.status(500).json({ error: "Failed to Update Estimation" });
    }
    console.log("Estimation Updated successfully");
    return res.status(200).json({ message: "Estimation Updated successfully" });
  });
};

const RemoveProd_fromShipmentTrans = (req, res) => {
  const jsonData = JSON.stringify(req.body);
  console.log(jsonData);
  const sql = "CALL inv.sp_edit_removeProductfrom_shippment_transaction(?);";
  db.query(sql, [jsonData], (err, result) => {
    if (err) {
      console.error("Database insertion error:", err);
      return res.status(500).json({
        error: "Failed to Remove product from shipment in Sale Order",
      });
    }
    console.log(
      "Unshipped product remove from Sale order Updated successfully"
    );
    return res.status(200).json({
      message: "Unshipped product remove from Sale order Updated successfully",
    });
  });
};

const getSaleOrderDetail = (req, res) => {
  const { so_id } = req.body;
  // console.log(so_id)
  const sql =
    "select s.so_id, c.name as customer, s.customer_po_no, s.project_name, s.ship_method, s.tracking_no, i.total_price, s.amount_paid, " +
    "s.amount_pending, ss.name as status,u.username as user,s.so_note, i.tax, i.shipment from inv.sale_orders s left outer join inv.customers c " +
    "on s.customer_id = c.customer_id left outer join inv.users u on s.user_id = u.user_id left outer join inv.invoices i " +
    "on s.so_id = i.so_id left outer join inv.sale_order_status ss on s.status_id = ss.status_id where s.so_id = ? ;";

  db.query(sql, [so_id], (err, result) => {
    if (err) {
      console.error("Database insertion error:", err);
      return res.status(500).json({ error: "Failed to fetch records" });
    }
    console.log("Get Sale Order Detail");
    // console.log(result);
    return res.status(200).json(result);
  });
};

const getSaleOrderDetailShipmentByID = (req, res) => {
  const { so_id } = req.body;
  // console.log(so_id)
  const sql =
    "select distinct p.product_id, p.name as product,p.code,sop.discount, p.unit_price, COALESCE(sop.quantity,0) as quantity, sop.price, " +
    "COALESCE(tt.qty_ship ,0) as quantity_shipped,(sop.price * tt.qty_ship) as total, (sop.price * sop.quantity) as e_total from inv.sale_order_products sop left outer join inv.products p " +
    "on sop.product_id=p.product_id left outer join " +
    "(select distinct sum(quantity_shipped) as qty_ship, product_id,so_id from inv.shipments group by " +
    "product_id, so_id) as tt on tt.product_id = sop.product_id and tt.so_id = sop.so_id where sop.so_id = ? ;";

  db.query(sql, [so_id], (err, result) => {
    if (err) {
      console.error("Database insertion error:", err);
      return res.status(500).json({ error: "Failed to fetch records" });
    }
    console.log("Get Sale Order Shipment Details");
    // console.log(result);
    return res.status(200).json(result);
  });
};

const getShipmentSaleOrderByID = (req, res) => {
  const { so_id } = req.body;
  // console.log(so_id)
  const sql =
    "select s.so_id,s.sale_date, c.name as customer, i.invoice_id from inv.sale_orders s left outer join " +
    "inv.customers c on s.customer_id=c.customer_id left outer join inv.invoices i on s.so_id=i.so_id where " +
    "s.so_id = ? ;";

  db.query(sql, [so_id], (err, result) => {
    if (err) {
      console.error("Database insertion error:", err);
      return res.status(500).json({ error: "Failed to fetch records" });
    }
    console.log("Get Sale Order ShipmentProduct By ID Details");
    // console.log(result);
    return res.status(200).json(result);
  });
};

const getShipmentProductsBySO_ID = (req, res) => {
  const { so_id, store_id } = req.body;
  console.log(req.body);
  const sql =
    "select distinct p.product_id, p.code, p.name as product, COALESCE(sop.quantity,0) as total_qty, p.details, COALESCE(tt.qty_ship,0) as quantity_shipped, " +
    "COALESCE(ss.lst,0) as last_qty from inv.sale_order_products sop left outer join inv.shipments sh on sop.product_id=sh.product_id and " +
    "sop.so_id = sh.so_id left outer join inv.products p on p.product_id = sop.product_id left outer join inv.inventories i on " +
    "i.product_id = p.product_id left outer join (select distinct sum(quantity_shipped) as qty_ship, product_id,so_id from inv.shipments group by " +
    "product_id, so_id) as tt on tt.product_id = sh.product_id and tt.so_id = sh.so_id left outer join (select quantity_shipped as lst, product_id, so_id " +
    "from inv.shipments where shipment_id = (select max(shipment_id) from inv.shipments)) as ss " +
    "on ss.product_id = sh.product_id and ss.so_id = sh.so_id where sop.so_id = ? and i.store_id = ? ;";

  db.query(sql, [so_id, store_id], (err, result) => {
    if (err) {
      console.error("Database insertion error:", err);
      return res.status(500).json({ error: "Failed to fetch records" });
    }
    console.log("Get Shipment Products By SO ID");
    console.log(result);
    return res.status(200).json(result);
  });
};

const EditShipment = (req, res) => {
  const jsonData = JSON.stringify(req.body);
  const sql = "call inv.sp_edit_shipment_Products(?);";
  db.query(sql, [jsonData], (err, result) => {
    if (err) {
      console.error("Database insertion error:", err);
      return res
        .status(500)
        .json({ error: "Failed to Update Shipment Products" });
    }
    console.log("Shipment Updated successfully");
    return res.status(200).json({ message: "Shipment Updated successfully" });
  });
};

const EditSaleOrderStatus = (req, res) => {
  const { so_id } = req.body;
  // console.log(jsonData);
  const sql = "call inv.update_sale_order_statue(?);";

  db.query(sql, [so_id, so_id], (err, result) => {
    if (err) {
      console.error("Database insertion error:", err);
      return res
        .status(500)
        .json({ error: "Failed to Update Shipment Products" });
    }

    console.log("Sale Order Status Updated successfully");
    console.log(result);
    return res.status(200).json(result);
  });
};

const EditSaleOrderStatusBYSo_id = (req, res) => {
  const { so_id, status_id } = req.body;
  // console.log(jsonData);
  const sql = "update inv.sale_orders set status_id = ? where so_id = ?";

  db.query(sql, [status_id, so_id], (err, result) => {
    if (err) {
      console.error("Database insertion error:", err);
      return res
        .status(500)
        .json({ error: "Failed to Update Shipment Products" });
    }

    console.log("Sale Order Status Updated successfully");
    console.log(result);
    return res.status(200).json(result);
  });
};

const addEstimation = (req, res) => {
  const jsonData = JSON.stringify(req.body);
  console.log(jsonData);
  const sql = "CALL inv.sp_add_estimation(?);";
  db.query(sql, [jsonData], (err, result) => {
    if (err) {
      console.error("Database insertion error:", err);
      return res.status(500).json({ error: "Failed to Create Estimation" });
    }
    console.log("Estimation Creation successfully");
    console.log(result);
    return res.status(200).json(result);
  });
};

module.exports = {
  getAllSalesByID,
  getCustomerByID,
  addSaleOrder,
  getSaleOrderDetailsByID,
  getSaleOrderCustomerByID,
  deleteEditSaleOrderProduct,
  EditSaleOrder,
  RemoveProd_fromShipmentTrans,
  getSaleOrderDetailShipmentByID,
  getSaleOrderDetail,
  getShipmentSaleOrderByID,
  getShipmentProductsBySO_ID,
  EditShipment,
  EditSaleOrderStatus,
  addEstimation,
  EditSaleOrderStatusBYSo_id,
  EditEstimation,
};
