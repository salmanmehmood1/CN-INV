const db = require("../connection/connection");

const getAllSupplier = (req, res) => {
  const sql =
    "SELECT v.vendor_id,v.name, v.profile, v.phone, v.contact_name,v.website,r.city, s.attention_name,l.end_balance as balance, m.end_balance as opening_balance FROM inv.vendors v " +
    "left outer join inv.remitting_addresses r on v.remitting_address_id = r.r_address_id " +
    "left outer join inv.shipping_addresses s on v.shipping_address_id = s.s_address_id " +
    "left outer join inv.ledgers l on v.account_id = l.account_id left outer join inv.ledgers m on v.account_id = m.account_id " +
    "where l.ledger_id = (select max(k.ledger_id) from inv.ledgers k where k.account_id = v.account_id) and " +
    "m.ledger_id = (select min(r.ledger_id) from inv.ledgers r where r.account_id = v.account_id and r.type_id = 900) " +
    "order by v.vendor_id desc limit 4999;";
  db.query(sql, (err, result) => {
    //console.log(result);
    const SupplierWithImage = result.map((supplier) => {
      return {
        ...supplier,
        profile: supplier.profile ? supplier.profile.toString("base64") : null,
      };
    });
    return res.json(SupplierWithImage);
  });
};

const addSupplier = (req, res) => {
  // console.log(req.body);
  const {
    name,
    phone,
    website,
    contact_name,
    contact_phone,
    contact_email,
    notes,
    r_street,
    r_city,
    r_state,
    r_zip,
    r_country,
    r_phone,
    s_street,
    s_city,
    s_state,
    s_zip,
    s_country,
    s_attention_name,
    s_phone,
    type_id,
    acc_type_id,
    opening_balance,
  } = req.body;
  const profile = req.file.buffer;
  var m = null;
  if (req.file) {
    m = profile;
  }

  const jsonData = JSON.stringify({
    name: name,
    phone: phone,
    website: website,
    contact_name: contact_name,
    contact_phone: contact_phone,
    contact_email: contact_email,
    notes: notes,
    r_street: r_street,
    r_city: r_city,
    r_state: r_state,
    r_zip: r_zip,
    r_country: r_country,
    r_phone: r_phone,
    s_street: s_street,
    s_city: s_city,
    s_state: s_state,
    s_zip: s_zip,
    s_country: s_country,
    s_attention_name: s_attention_name,
    s_phone: s_phone,
    acc_name: name,
    acc_type_id: acc_type_id,
    type_id: type_id,
    opening_balance: opening_balance,
  });

  console.log(jsonData);
  const sql = "CALL inv.sp_add_supplier(?,?);";
  db.query(sql, [jsonData, m], (err, result) => {
    if (err) {
      console.error("Database insertion error:", err);
      return res.status(500).json({ error: "Failed to Add Supplier" });
    }
    console.log("Supplier Added successfully");
    return res.status(200).json({ message: "Supplier Added successfully" });
  });
};

const editSupplier = (req, res) => {
  console.log(req.body);
  // if (!req.file) {
  //   return res.status(400).json({ error: "No file uploaded" });
  // }
  const {
    supplier_id,
    name,
    phone,
    website,
    contact_name,
    contact_phone,
    contact_email,
    notes,
    remitting_address_id,
    r_street,
    r_city,
    r_state,
    r_zip,
    r_country,
    r_phone,
    shipping_address_id,
    s_street,
    s_city,
    s_state,
    s_zip,
    s_country,
    s_attention_name,
    s_phone,
    account_id,
    acc_type_id,
    type_id,
    opening_balance,
  } = req.body;
  const profile = req.file.buffer;
  var m = null;
  if (req.file) {
    m = profile;
  }

  const jsonData = JSON.stringify({
    vendor_id: supplier_id,
    name: name,
    phone: phone,
    website: website,
    contact_name: contact_name,
    contact_phone: contact_phone,
    contact_email: contact_email,
    notes: notes,
    remitting_address_id: remitting_address_id,
    r_street: r_street,
    r_city: r_city,
    r_state: r_state,
    r_zip: r_zip,
    r_country: r_country,
    r_phone: r_phone,
    shipping_address_id: shipping_address_id,
    s_street: s_street,
    s_city: s_city,
    s_state: s_state,
    s_zip: s_zip,
    s_country: s_country,
    s_attention_name: s_attention_name,
    s_phone: s_phone,
    account_id: account_id,
    acc_type_id: acc_type_id,
    type_id: type_id,
    opening_balance: opening_balance,
  });
  console.log(jsonData);
  const sql = "CALL inv.sp_edit_supplier(?,?);";
  db.query(sql, [jsonData, m], (err, result) => {
    if (err) {
      console.error("Database insertion error:", err);
      return res.status(500).json({ error: "Failed to Update Supplier" });
    }
    console.log("Supplier Updated successfully");
    return res.status(200).json({ message: "Supplier Updated successfully" });
  });
};

const getSupplierByID = (req, res) => {
  const { supplier_id } = req.body;
  const sql =
    "SELECT v.*, r.state as r_state, r.city as r_city, r.country as r_country,r.street as r_street, r.zip as r_zip, r.phone as r_phone, " +
    "s.state as s_state, s.city as s_city, s.country as s_country,s.street as s_street, s.zip as s_zip, s.phone as s_phone, attention_name, " +
    "a.name as acc_name, a.description as acc_desc, a.notes as acc_notes, d.end_balance as opening_balance, " +
    "d.datetime as ledger_date, d.note as ledger_note, a.type_id as acc_type_id " +
    "FROM inv.vendors v left join inv.remitting_addresses r on v.remitting_address_id = r.r_address_id " +
    "left join inv.shipping_addresses s on v.shipping_address_id = s.s_address_id " +
    "left join inv.accounts a on v.account_id = a.account_id left join inv.ledgers d on d.account_id = a.account_id " +
    "where v.vendor_id = ? and d.type_id = 900;";
  db.query(sql, [supplier_id], (err, result) => {
    if (err) {
      console.error("Database insertion error:", err);
      return res.status(500).json({ error: "Failed to fetch records" });
    }
    const productsWithImages = result.map((product) => {
      if (product && product.profile) {
        product.profile = product.profile.toString("base64");
      }
      return product;
    });
    console.log(productsWithImages);
    console.log("Get Supplier Details by ID");
    return res.status(200).json(productsWithImages);
  });
};

const getAllVendorsName = (req, res) => {
  const sql =
    'SELECT vendor_id, concat(vendor_id," ", name) as name from  inv.vendors;';
  db.query(sql, (err, result) => {
    if (err) {
      console.error("Database insertion error:", err);
      return res.status(500).json({ error: "Failed to fetch records" });
    }
    console.log("Get Vendor All Names");
    return res.status(200).json(result);
  });
};

const CheckVendNameExist = (req, res) => {
  // console.log(req.body);
  const sql =
    "select case when exists (select vendor_id from inv.vendors where name = ? ) then 1 else 0 end as name;";
  const { name } = req.body;
  db.query(sql, [name], (err, result) => {
    if (err) {
      console.error("Database get error:", err);
      return res.status(500).json({ error: "Failed to check Name exist" });
    }
    console.log(result);
    return res.status(200).json(result);
  });
};

module.exports = {
  getAllSupplier,
  addSupplier,
  getSupplierByID,
  editSupplier,
  getAllVendorsName,
  CheckVendNameExist,
};
