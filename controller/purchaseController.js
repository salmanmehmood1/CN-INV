const db = require("../connection/connection");

const getAllPurchaseByID = (req, res) => {
  // console.log(req.body)
  const { store_id } = req.body;
  const sql =
    "select p.po_id, concat('P' , p.po_id ) as po, DATE_FORMAT(p.order_date, '%m/%d/%Y %l:%i:%s %p') as order_date, v.name as vendor, p.vendor_invoice_no, s.name as status, p.total, p.amount_paid as amt, p.amount_pending " +
    "from inv.purchase_orders p left outer join inv.vendors v on p.vendor_id = v.vendor_id left outer join inv.purchase_order_status s " +
    "on p.status_id = s.status_id left outer join inv.stores ss on p.store_id = ss.store_id where p.store_id = ? order by p.po_id desc limit 5000;";

  db.query(sql, [store_id], (err, result) => {
    if (err) {
      console.error("Database insertion error:", err);
      return res.status(500).json({ error: "Failed to fetch records" });
    }
    console.log("Get All Purchase By Store ID");
    // console.log(result)
    return res.status(200).json(result);
  });
};

const getProductsByStoreVendorId = (req, res) => {
  // console.log(req.body.store_id);
  const sql =
    "SELECT p.product_id, p.name as productname, p.code FROM inv.products p INNER JOIN inv.inventories i ON p.product_id=i.product_id left outer join inv.vendor_products vp " +
    " on vp.product_id=p.product_id WHERE i.store_id = ? and vp.vendor_id = ?";

  // Access store_id from headers
  const store_id = req.body.store_id;
  const vendor_id = req.body.vendor_id;
  console.log(vendor_id);
  db.query(sql, [store_id, vendor_id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    // console.log(result);
    return res.json(result);
  });
};

const addPurchaseOrder = (req, res) => {
  const jsonData = JSON.stringify(req.body);
  // console.log(jsonData);
  const sql = "CALL inv.sp_add_purchase_order(?);";
  db.query(sql, [jsonData], (err, result) => {
    if (err) {
      console.error("Database insertion error:", err);
      return res.status(500).json({ error: "Failed to Create Purchase Order" });
    }
    console.log(result);
    console.log("Purchase order Created successfully");
    return res.status(200).json(result);
  });
};

const getPurchaseOrderDetailsByID = (req, res) => {
  const { po_id } = req.body;
  const sql =
    "select p.product_id, p.code, p.name as product_name, pop.unit_price, COALESCE(pop.quantity,0) as quantity, pop.discount, COALESCE(ss.product_received,0) as product_received " +
    "from inv.purchase_orders po left outer join inv.purchase_order_products pop on po.po_id = pop.po_id " +
    "left outer join inv.products p on pop.product_id = p.product_id " +
    "left outer join (select distinct sum(quantity_recv) as product_received, product_id,po_id from inv.receive_log group by " +
    "product_id, po_id) as ss on ss.product_id = pop.product_id and ss.po_id = pop.po_id " +
    "where po.po_id = ? ; ";
  db.query(sql, [po_id], (err, result) => {
    if (err) {
      console.error("Database insertion error:", err);
      return res.status(500).json({ error: "Failed to fetch records" });
    }
    console.log("Get Purchase Order Details by ID");
    // console.log(result)
    return res.status(200).json(result);
  });
};

const getPurchaseOrderVendorByID = (req, res) => {
  const { po_id } = req.body;
  const sql =
    "select  v.vendor_id, v.name, p.vendor_invoice_no,p.status_id, pop.recv_by, p.ship_method, p.tracking_no, p.po_note, pop.recv_by from " +
    "inv.purchase_orders p left outer join inv.vendors v on p.vendor_id = v.vendor_id left outer join inv.purchase_order_products pp " +
    "on p.po_id= pp.po_id left outer join inv.receive_log pop on pp.product_id = pop.product_id and pop.po_id = p.po_id where p.po_id= ? limit 1;";
  db.query(sql, [po_id], (err, result) => {
    if (err) {
      console.error("Database insertion error:", err);
      return res.status(500).json({ error: "Failed to fetch records" });
    }
    console.log("Get Purchase Order Vendor Details by ID");
    console.log(result);
    return res.status(200).json(result);
  });
};

const EditPurchaseOrder = (req, res) => {
  const jsonData = JSON.stringify(req.body);
  console.log(jsonData);
  const sql = "CALL inv.sp_edit_purchase_order(?);";
  db.query(sql, [jsonData], (err, result) => {
    if (err) {
      console.error("Database insertion error:", err);
      return res.status(500).json({ error: "Failed to Update Purchase Order" });
    }
    console.log("Purchase order Updated successfully");
    return res
      .status(200)
      .json({ message: "Purchase order Updated successfully" });
  });
};

const deleteEditPurchaseOrderProduct = (req, res) => {
  const jsonData = JSON.stringify(req.body);
  // console.log(jsonData);
  const sql = "CALL inv.sp_delete_purchase_order_edit_product(?);";
  db.query(sql, [jsonData], (err, result) => {
    if (err) {
      console.error("Database insertion error:", err);
      return res
        .status(500)
        .json({ error: "Failed to Delete product from Edit Purchase Order" });
    }
    console.log("Product deleted from Purchase order successfully");
    return res
      .status(200)
      .json({ message: "Product deleted from Purchase order successfully" });
  });
};

const getReceiveProductsByPO_ID = (req, res) => {
  const { po_id, store_id } = req.body;
  // console.log(so_id)
  const sql =
    "select distinct p.code, p.product_id, p.code, p.name as product, COALESCE(pop.quantity,0) as total_qty, p.details, " +
    "COALESCE(tt.qty_recv, 0) as qty_recv, COALESCE(ss.qty_reject,0) as qty_reject, COALESCE(rr.lst_qty_recv,0) as last_qty_recv, " +
    "COALESCE(zz.lst_qty_rej, 0) as last_qty_reject " +
    "from inv.purchase_order_products pop left outer join inv.receive_log r on pop.product_id = r.product_id and " +
    "pop.po_id = r.po_id left outer join inv.products p on pop.product_id = p.product_id left outer join (select distinct " +
    "sum(quantity_recv) as qty_recv, product_id, po_id from inv.receive_log group by product_id, po_id) as tt " +
    "on r.product_id = tt.product_id and r.po_id = tt.po_id left outer join (select distinct " +
    "sum(quantity_reject) as qty_reject, product_id, po_id from inv.receive_log group by product_id, po_id) " +
    "as ss on r.product_id = ss.product_id and r.po_id = ss.po_id left outer join (select quantity_recv as lst_qty_recv, product_id, po_id " +
    "from inv.receive_log where log_id = (select max(log_id) from inv.receive_log)) as rr on r.product_id = rr.product_id and r.po_id = rr.po_id " +
    "left outer join (select quantity_reject as lst_qty_rej, product_id, po_id " +
    "from inv.receive_log where log_id = (select max(log_id) from inv.receive_log)) as zz on r.product_id = zz.product_id and r.po_id = zz.po_id " +
    "left outer join inv.inventories i on i.product_id = pop.product_id where pop.po_id = ? and i.store_id = ? ;";

  db.query(sql, [po_id, store_id], (err, result) => {
    if (err) {
      console.error("Database insertion error:", err);
      return res.status(500).json({ error: "Failed to fetch records" });
    }
    console.log("Get Receive Log Products By PO ID");
    // console.log(result);
    return res.status(200).json(result);
  });
};

const getReceiveLogPurchaseOrderByID = (req, res) => {
  const { po_id, store_id } = req.body;
  // console.log(so_id)
  const sql =
    "select p.po_id, p. order_date, p.vendor_invoice_no, u.username, u.user_id, v.name as vendor from " +
    "inv.purchase_orders p left outer join inv.users u on p.user_id = u.user_id  left outer join " +
    "inv.vendors v on p.vendor_id = v.vendor_id where p.po_id = ? and p.store_id = ? ;";

  db.query(sql, [po_id, store_id], (err, result) => {
    if (err) {
      console.error("Database insertion error:", err);
      return res.status(500).json({ error: "Failed to fetch records" });
    }
    console.log("Get Purchase Order Receive By ID Details");
    // console.log(result);
    return res.status(200).json(result);
  });
};

const EditReceive_Log = (req, res) => {
  const jsonData = JSON.stringify(req.body);
  console.log(jsonData);
  const sql = "call inv.sp_edit_receive_log_Products(?);";
  db.query(sql, [jsonData], (err, result) => {
    if (err) {
      console.error("Database insertion error:", err);
      return res
        .status(500)
        .json({ error: "Failed to Update Receive Log Products" });
    }
    console.log("Receive Log Updated successfully");
    return res
      .status(200)
      .json({ message: "Receive Log Updated successfully" });
  });
};

const getPurchaseOrderDetailRecByID = (req, res) => {
  const { po_id } = req.body;
  // console.log(so_id)
  const sql =
    "select distinct p.product_id, p.name as product, p.code,pop.discount, pop.unit_price, COALESCE(tt.qty_recv,0) as qty_recv, " +
    "COALESCE(tt.qty_rej,0) as qty_rej, p.details, COALESCE(pop.quantity,0) as quantity, COALESCE((pop.unit_price * tt.qty_recv),0) " +
    "as total from inv.purchase_order_products pop left outer join inv.products p on pop.product_id=p.product_id " +
    "left outer join inv.receive_log r on pop.product_id=r.product_id and pop.po_id=r.po_id " +
    "left outer join (select distinct sum(quantity_recv) as qty_recv, sum(quantity_reject) as qty_rej, product_id,po_id " +
    "from inv.receive_log group by product_id, po_id) as tt on tt.product_id = pop.product_id and tt.po_id = pop.po_id " +
    "where pop.po_id = ? ;";

  db.query(sql, [po_id], (err, result) => {
    if (err) {
      console.error("Database insertion error:", err);
      return res.status(500).json({ error: "Failed to fetch records" });
    }
    console.log("Get Purchase Order Receive Details");
    console.log(result);
    return res.status(200).json(result);
  });
};

const getPurchaseOrderDetail = (req, res) => {
  const { po_id } = req.body;
  // console.log(so_id)
  const sql =
    "select concat('P', s.po_id) as po_id, c.name as vendor, s.vendor_invoice_no, s.ship_method, s.tracking_no, COALESCE(s.total,0) as total, " +
    "COALESCE(s.amount_paid,0) as amount_paid, COALESCE(s.amount_pending,0) as amount_pending, ss.name as status,u.username as user, " +
    "s.po_note from inv.purchase_orders s left outer join inv.vendors c on s.vendor_id = c.vendor_id left outer join inv.users u " +
    "on s.user_id = u.user_id left outer join inv.purchase_order_status ss on s.status_id = ss.status_id where s.po_id = ? ;";

  db.query(sql, [po_id], (err, result) => {
    if (err) {
      console.error("Database insertion error:", err);
      return res.status(500).json({ error: "Failed to fetch records" });
    }
    console.log("Get Purchase Order Detail");
    // console.log(result);
    return res.status(200).json(result);
  });
};

const EditPurchaseStatusBYPo_id = (req, res) => {
  const { po_id, status_id } = req.body;
  // console.log(jsonData);
  const sql = "update inv.purchase_orders set status_id = ? where po_id = ?";

  db.query(sql, [status_id, po_id], (err, result) => {
    if (err) {
      console.error("Database insertion error:", err);
      return res
        .status(500)
        .json({ error: "Failed to Update Receive Products status" });
    }

    console.log("Purchase Order Status Updated successfully");
    console.log(result);
    return res.status(200).json(result);
  });
};

module.exports = {
  getAllPurchaseByID,
  getProductsByStoreVendorId,
  addPurchaseOrder,
  getPurchaseOrderDetailsByID,
  getPurchaseOrderVendorByID,
  EditPurchaseOrder,
  deleteEditPurchaseOrderProduct,
  getReceiveProductsByPO_ID,
  getReceiveLogPurchaseOrderByID,
  EditReceive_Log,
  getPurchaseOrderDetailRecByID,
  getPurchaseOrderDetail,
  EditPurchaseStatusBYPo_id,
};
