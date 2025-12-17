import React, { useState } from "react";
import "./CompanyForm.css";
import api from "../../api";

export default function CompanyForm() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // ------------------ initial form ------------------
  const [form, setForm] = useState({
    company_name: "",
    company_type: "",
    major_activity: "",
    nature_services: [""],
    nature_products: [""],
    company_address: "",
    gstin_no: "",
    msme_no: "",
    enterprise_type: "",
    account_number: "",
    ifsc_code: "",
    account_holder_name: "",
    bank_name: "",
    bank_phone: "",
    gst_certificate: null,
    msme_certificate: null,
    cancel_cheque: null,

    // People lists
    directors: [{ name: "", email: "", phone: "" }],
    owners: [{ name: "", email: "", phone: "" }],
    members: [{ name: "", email: "", phone: "" }],
    partners: [{ name: "", email: "", phone: "" }, { name: "", email: "", phone: "" }],

    // Step 5 docs
    pan_card: null,
    incorporation_certificate: null,
    eft_mandate: null,
    oem_turnover_certificate: null,
    bidder_turnover_certificate: null,
    networth_certificate: null,
    audited_balance_sheet: null,
    purchase_document: null,
    undertaking_blacklisting: null,
    quality_certificate: null,
    epf_registration: null,
    esic_registration: null,
    factory_license: null,
    product_catalog: null,
  });

  // ===================== helpers =====================
  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const onFileChange = (e) => {
    const { name, files } = e.target;
    setForm((s) => ({ ...s, [name]: files[0] }));
  };

  const addArrayItem = (field, val) => {
    setForm((s) => ({ ...s, [field]: [...s[field], val] }));
  };

  const removeArrayItem = (field, index) => {
    setForm((s) => ({
      ...s,
      [field]: s[field].filter((_, i) => i !== index),
    }));
  };

  const updateArrayField = (field, index, val) => {
    const arr = [...form[field]];
    arr[index] = val;
    setForm((s) => ({ ...s, [field]: arr }));
  };

  const addPerson = (list) => {
    setForm((s) => ({
      ...s,
      [list]: [...s[list], { name: "", email: "", phone: "" }],
    }));
  };

  const removePerson = (list, index) => {
    setForm((s) => ({
      ...s,
      [list]: s[list].filter((_, i) => i !== index),
    }));
  };

  const updatePersonList = (list, index, key, val) => {
    const arr = [...form[list]];
    arr[index][key] = val;
    setForm((s) => ({ ...s, [list]: arr }));
  };

  // ============== simple step validator ==============
  const validateStep = () => {
    switch (step) {
      case 1:
        return form.company_name && form.company_type && form.major_activity;
      case 2:
        return form.company_address && form.enterprise_type;
      case 3:
        return form.account_number && form.ifsc_code && form.bank_name;
      case 4:
        return true; // basic validation skipped for dynamic members
      case 5:
        return true;
      default:
        return true;
    }
  };

  // ============== navigation ==============
  const nextStep = () => {
    if (validateStep()) setStep((s) => Math.min(5, s + 1));
    else setError("⚠ Please fill required fields before continuing.");
  };

  const prevStep = () => setStep((s) => Math.max(1, s - 1));

  // ============== submit ==============
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep()) {
      setError("Please fill required fields.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const fd = new FormData();

      const simpleFields = [
        "company_name", "company_type", "major_activity",
        "company_address", "gstin_no", "msme_no", "enterprise_type",
        "account_number", "ifsc_code", "account_holder_name", "bank_name", "bank_phone"
      ];
      simpleFields.forEach((key) => fd.append(key, form[key] ?? ""));

      // base file fields
      const baseFiles = ["gst_certificate", "msme_certificate", "cancel_cheque"];
      baseFiles.forEach((key) => {
        if (form[key]) fd.append(key, form[key], form[key].name);
      });

      // step 5 docs
      const docFields = [
        "pan_card", "incorporation_certificate", "eft_mandate",
        "oem_turnover_certificate", "bidder_turnover_certificate",
        "networth_certificate", "audited_balance_sheet", "purchase_document",
        "undertaking_blacklisting", "quality_certificate", "epf_registration",
        "esic_registration", "factory_license", "product_catalog",
      ];
      docFields.forEach((key) => {
        if (form[key]) fd.append(key, form[key], form[key].name);
      });

      // arrays
      fd.append(
        "nature_of_business",
        JSON.stringify({
          services: form.nature_services.filter((s) => s.trim()),
          products: form.nature_products.filter((p) => p.trim()),
        })
      );

      // people
      if (form.directors && form.company_type === "PVT_LTD")
        fd.append("directors", JSON.stringify(form.directors));
      if (form.owners && form.company_type === "PROPRIETORSHIP")
        fd.append("owners", JSON.stringify(form.owners));
      if (form.members && form.company_type === "LLP")
        fd.append("members", JSON.stringify(form.members));
      if (form.partners && form.company_type === "PARTNERSHIP")
        fd.append("partners", JSON.stringify(form.partners));

      const res = await api.post("/companies/", fd, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });

      alert("✅ Company registered successfully!");
      console.log("Response:", res.data);
      setStep(1);
    } catch (err) {
      console.error(err.response?.data || err.message);
      setError(err.response?.data || "Submission failed");
      alert("❌ Submission failed. Check console for details.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const companyType = form.company_type;

  // ===================== UI =====================
  return (
    <div className="company-form-root">
      <form onSubmit={handleSubmit} className="card">
        <h2>Register Company</h2>

        <div className="steps">
          {[1, 2, 3, 4, 5].map((n) => (
            <div key={n} className={step >= n ? "step active" : "step"}>
              {n}
            </div>
          ))}
        </div>

        {/* STEP 1 */}
        {step === 1 && (
          <>
            <label>Company Name</label>
            <input name="company_name" value={form.company_name} onChange={onChange} required />

            <label>Company Type</label>
            <select name="company_type" value={form.company_type} onChange={onChange} required>
              <option value="">-- Select --</option>
              <option value="PVT_LTD">Pvt. Ltd.</option>
              <option value="LLP">LLP</option>
              <option value="PARTNERSHIP">Partnership</option>
              <option value="PROPRIETORSHIP">Proprietorship</option>
              <option value="ENTERPRISES">Enterprises</option>
              <option value="OTHER">Other</option>
            </select>

            <label>Major Activity</label>
            <select name="major_activity" value={form.major_activity} onChange={onChange} required>
              <option value="">-- Select --</option>
              <option value="MANUFACTURE">Manufacture</option>
              <option value="SERVICES">Services</option>
              <option value="TRADER">Trader</option>
              <option value="RESELLER">Reseller</option>
            </select>

            <label>Nature of Business - Services</label>
            {form.nature_services.map((s, i) => (
              <div key={`s-${i}`} className="inline-row">
                <input value={s} onChange={(e) => updateArrayField("nature_services", i, e.target.value)} />
                {i > 0 && <button type="button" onClick={() => removeArrayItem("nature_services", i)}>❌</button>}
              </div>
            ))}
            <button type="button" onClick={() => addArrayItem("nature_services", "")}>➕ Add Service</button>

            <label>Nature of Business - Products</label>
            {form.nature_products.map((p, i) => (
              <div key={`p-${i}`} className="inline-row">
                <input value={p} onChange={(e) => updateArrayField("nature_products", i, e.target.value)} />
                {i > 0 && <button type="button" onClick={() => removeArrayItem("nature_products", i)}>❌</button>}
              </div>
            ))}
            <button type="button" onClick={() => addArrayItem("nature_products", "")}>➕ Add Product</button>

            <div className="nav">
              <button type="button" onClick={nextStep} className="primary">Next ➡</button>
            </div>
          </>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <>
            <label>Company Address</label>
            <textarea name="company_address" value={form.company_address} onChange={onChange} required />

            <label>GSTIN No.</label>
            <input name="gstin_no" value={form.gstin_no} onChange={onChange} />
            <label>GST Certificate</label>
            <input type="file" name="gst_certificate" onChange={onFileChange} accept=".pdf,.doc,.docx" />

            <label>MSME No.</label>
            <input name="msme_no" value={form.msme_no} onChange={onChange} />
            <label>MSME Certificate</label>
            <input type="file" name="msme_certificate" onChange={onFileChange} accept=".pdf,.doc,.docx" />

            <label>Enterprise Type</label>
            <select name="enterprise_type" value={form.enterprise_type} onChange={onChange} required>
              <option value="">-- Select --</option>
              <option value="MICRO">Micro</option>
              <option value="SMALL">Small</option>
              <option value="MEDIUM">Medium</option>
            </select>

            <div className="nav">
              <button type="button" onClick={prevStep}>⬅ Previous</button>
              <button type="button" onClick={nextStep} className="primary">Next ➡</button>
            </div>
          </>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <>
            <label>Account Number</label>
            <input name="account_number" value={form.account_number} onChange={onChange} required />

            <label>IFSC Code</label>
            <input name="ifsc_code" value={form.ifsc_code} onChange={onChange} required />

            <label>Account Holder Name</label>
            <input name="account_holder_name" value={form.account_holder_name} onChange={onChange} required />

            <label>Bank Name</label>
            <input name="bank_name" value={form.bank_name} onChange={onChange} required />

            <label>Bank Phone</label>
            <input name="bank_phone" value={form.bank_phone} onChange={onChange} />

            <label>Cancel Cheque</label>
            <input type="file" name="cancel_cheque" onChange={onFileChange} accept=".pdf,.jpg,.png" />

            <div className="nav">
              <button type="button" onClick={prevStep}>⬅ Previous</button>
              <button type="button" onClick={nextStep} className="primary">Next ➡</button>
            </div>
          </>
        )}

        {/* STEP 4 */}
        {step === 4 && (
          <>
            <h3>Owners / Directors / Members / Partners</h3>

            {companyType === "PVT_LTD" && (
              <>
                <p>Add Directors</p>
                {form.directors.map((d, i) => (
                  <div key={`dir-${i}`} className="person-row">
                    <input placeholder="Name" value={d.name} onChange={(e) => updatePersonList("directors", i, "name", e.target.value)} />
                    <input placeholder="Email" value={d.email} onChange={(e) => updatePersonList("directors", i, "email", e.target.value)} />
                    <input placeholder="Phone" value={d.phone} onChange={(e) => updatePersonList("directors", i, "phone", e.target.value)} />
                    {i > 0 && <button type="button" onClick={() => removePerson("directors", i)}>❌</button>}
                  </div>
                ))}
                <button type="button" onClick={() => addPerson("directors")}>➕ Add Director</button>
              </>
            )}

            {companyType === "PROPRIETORSHIP" && (
              <>
                <p>Owner Details</p>
                <div className="person-row">
                  <input placeholder="Owner Name" value={form.owners[0].name} onChange={(e) => updatePersonList("owners", 0, "name", e.target.value)} />
                  <input placeholder="Email" value={form.owners[0].email} onChange={(e) => updatePersonList("owners", 0, "email", e.target.value)} />
                  <input placeholder="Phone" value={form.owners[0].phone} onChange={(e) => updatePersonList("owners", 0, "phone", e.target.value)} />
                </div>
              </>
            )}

            {companyType === "LLP" && (
              <>
                <p>Add Members</p>
                {form.members.map((m, i) => (
                  <div className="person-row" key={`mem-${i}`}>
                    <input placeholder="Name" value={m.name} onChange={(e) => updatePersonList("members", i, "name", e.target.value)} />
                    <input placeholder="Email" value={m.email} onChange={(e) => updatePersonList("members", i, "email", e.target.value)} />
                    <input placeholder="Phone" value={m.phone} onChange={(e) => updatePersonList("members", i, "phone", e.target.value)} />
                    {i > 0 && <button type="button" onClick={() => removePerson("members", i)}>❌</button>}
                  </div>
                ))}
                <button type="button" onClick={() => addPerson("members")}>➕ Add Member</button>
              </>
            )}

            {companyType === "PARTNERSHIP" && (
              <>
                <p>Partners (Only two)</p>
                {form.partners.map((p, i) => (
                  <div className="person-row" key={`par-${i}`}>
                    <input placeholder={`Partner ${i + 1} Name`} value={p.name} onChange={(e) => updatePersonList("partners", i, "name", e.target.value)} />
                    <input placeholder="Email" value={p.email} onChange={(e) => updatePersonList("partners", i, "email", e.target.value)} />
                    <input placeholder="Phone" value={p.phone} onChange={(e) => updatePersonList("partners", i, "phone", e.target.value)} />
                  </div>
                ))}
              </>
            )}

            <div className="nav">
              <button type="button" onClick={prevStep}>⬅ Previous</button>
              <button type="button" onClick={nextStep} className="primary">Next ➡</button>
            </div>
          </>
        )}

        {/* STEP 5 */}
        {step === 5 && (
          <>
            <h3>📂 Required Company Documents</h3>

            {[
              ["pan_card", "PAN Card"],
              ["incorporation_certificate", "Incorporation Certificate"],
              ["eft_mandate", "EFT Mandate"],
              ["oem_turnover_certificate", "OEM Turnover Certificate"],
              ["bidder_turnover_certificate", "Bidder Turnover Certificate"],
              ["networth_certificate", "Networth Certificate"],
              ["audited_balance_sheet", "Audited Balance Sheet"],
              ["purchase_document", "Purchase Document"],
              ["undertaking_blacklisting", "Undertaking for Not Blacklisting"],
              ["quality_certificate", "Quality Certificate"],
              ["epf_registration", "EPF Registration"],
              ["esic_registration", "ESIC Registration"],
              ["factory_license", "Factory License"],
              ["product_catalog", "Product Catalog"],
            ].map(([name, label]) => (
              <React.Fragment key={name}>
                <label>{label}</label>
                <input type="file" name={name} onChange={onFileChange} accept=".pdf,.jpg,.png" />
              </React.Fragment>
            ))}

            <div className="nav">
              <button type="button" onClick={prevStep}>⬅ Previous</button>
              <button type="submit" className="primary" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit ✅"}
              </button>
            </div>
          </>
        )}
      </form>

      {error && (
        <div className="error-banner">
          {typeof error === "string" ? error : JSON.stringify(error)}
        </div>
      )}
    </div>
  );
}
