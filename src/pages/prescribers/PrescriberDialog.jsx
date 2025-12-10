// PrescriberDialog.jsx
import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import {US_STATES} from '../../utils/util';

// const US_STATES = [
//   "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA",
//   "HI","ID","IL","IN","IA","KS","KY","LA","ME","MD",
//   "MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
//   "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC",
//   "SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"
// ];

// Validation Patterns
const NPI_REGEX = /^[0-9]{10}$/;
const DEA_REGEX = /^[A-Z]{2}[0-9]{7}$/;

const PrescriberDialog = ({ prescriber, onSave, onClose, notify }) => {

    const empty = {
        id: null,
        npi: "",
        deaNumber: "",
        stateLicenseNumber: "",
        taxonomyCode: "",
        firstName: "",
        lastName: "",
        middleName: "",
        suffix: "",
        clinicName: "",
        clinicContact: {},
        erxIdentifier: "",
        ncpdpProviderId: "",
        epcsEnabled: false,
        active: true,

        // Contact UI fields
        contactAddress: "",
        contactCity: "",
        contactState: "",
        contactPhone: "",
        contactFax: ""
    };

    const [data, setData] = useState(empty);

    useEffect(() => {
        if (prescriber) {
            const c = prescriber.contact || {};
            setData({
                ...prescriber,
                contactAddress: c.address || "",
                contactCity: c.city || "",
                contactState: c.state || "",
                contactPhone: c.phone || "",
                contactFax: c.fax || ""
            });
        } else {
            setData(empty);
        }
    }, [prescriber]);

    const handleField = (e) => {
        const { name, type, value, checked } = e.target;
        setData((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
    };

    const handleClinicContactJSON = (value) => {
        try {
            const parsed = JSON.parse(value);
            setData((p) => ({ ...p, clinicContact: parsed }));
        } catch {
            // ignore until valid
        }
    };

    const validate = () => {
        if (!NPI_REGEX.test(data.npi)) {
            notify("error", "Invalid NPI — must be 10 digits.");
            return false;
        }

        if (data.deaNumber && !DEA_REGEX.test(data.deaNumber)) {
            notify("error", "Invalid DEA Number (Format: 2 letters + 7 digits)");
            return false;
        }
        return true;
    };

    const save = () => {
        if (!validate()) return;

        const payload = {
            ...data,
            contact: {
                address: data.contactAddress,
                city: data.contactCity,
                state: data.contactState,
                phone: data.contactPhone,
                fax: data.contactFax,
            },
        };

        onSave(payload);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-screen overflow-y-auto p-6">

                {/* HEADER */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">
                        {data.id ? "Edit Prescriber" : "Add Prescriber"}
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X size={24} />
                    </button>
                </div>

                <div className="space-y-10">

                    {/* IDENTIFIERS */}
                    <section>
                        <h3 className="text-lg font-semibold mb-3 text-indigo-700">Identifiers</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <input
                                name="npi"
                                value={data.npi}
                                onChange={handleField}
                                placeholder="NPI (10 digits)"
                                className={`border p-2 rounded ${!NPI_REGEX.test(data.npi) ? "border-red-500" : ""}`}
                            />

                            <input
                                name="deaNumber"
                                value={data.deaNumber}
                                onChange={handleField}
                                placeholder="DEA Number"
                                className={`border p-2 rounded ${data.deaNumber && !DEA_REGEX.test(data.deaNumber) ? "border-red-500" : ""}`}
                            />

                            <input
                                name="stateLicenseNumber"
                                value={data.stateLicenseNumber}
                                onChange={handleField}
                                placeholder="State License Number"
                                className="border p-2 rounded"
                            />

                            <input
                                name="taxonomyCode"
                                value={data.taxonomyCode}
                                onChange={handleField}
                                placeholder="Taxonomy Code"
                                className="border p-2 rounded"
                            />
                        </div>
                    </section>

                    {/* NAME */}
                    <section>
                        <h3 className="text-lg font-semibold mb-3 text-indigo-700">Name</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <input name="firstName" className="border p-2 rounded" placeholder="First Name" value={data.firstName} onChange={handleField} />
                            <input name="lastName" className="border p-2 rounded" placeholder="Last Name" value={data.lastName} onChange={handleField} />
                            <input name="middleName" className="border p-2 rounded" placeholder="Middle Name" value={data.middleName} onChange={handleField} />
                            <input name="suffix" className="border p-2 rounded" placeholder="Suffix" value={data.suffix} onChange={handleField} />
                        </div>
                    </section>


                     {/* CLINIC INFO */}
                    <section>
                        <h3 className="text-lg font-semibold mb-3 text-indigo-700">Clinic Information</h3>

                        <div className="grid grid-cols-2 gap-4">
                            <input
                                name="clinicName"
                                placeholder="Clinic Name"
                                value={data.clinicName}
                                onChange={handleField}
                                className="border p-2 rounded col-span-2"
                            />

                            <input name="contactAddress" value={data.contactAddress} onChange={handleField} placeholder="Address" className="border p-2 rounded col-span-2" />

                            <input name="contactCity" value={data.contactCity} onChange={handleField} placeholder="City" className="border p-2 rounded" />

                            <select
                                name="contactState"
                                value={data.contactState}
                                onChange={handleField}
                                className="border p-2 rounded"
                            >
                                <option value="">Select State</option>
                                {US_STATES.map((s) => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>

                            <input name="contactPhone" value={data.contactPhone} onChange={handleField} placeholder="Phone" className="border p-2 rounded col-span-2" />
                            <input name="contactFax" value={data.contactFax} onChange={handleField} placeholder="Fax" className="border p-2 rounded col-span-2" />
                        </div>
                    </section>

                    {/* ERX INFO */}
                    <section>
                        <h3 className="text-lg font-semibold mb-3 text-indigo-700">eRx Information</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <input name="erxIdentifier" value={data.erxIdentifier} onChange={handleField} placeholder="eRx Identifier" className="border p-2 rounded" />
                            <input name="ncpdpProviderId" value={data.ncpdpProviderId} onChange={handleField} placeholder="NCPDP Provider ID" className="border p-2 rounded" />
                        </div>
                    </section>

                    {/* STATUS */}
                    <section>
                        <h3 className="text-lg font-semibold mb-3 text-indigo-700">Status</h3>
                        <div className="flex items-center gap-4">
                            <label className="flex items-center gap-2">
                                <input type="checkbox" name="active" checked={data.active} onChange={handleField} />
                                Active
                            </label>
                            <label className="flex items-center gap-2">
                                <input type="checkbox" name="epcsEnabled" checked={data.epcsEnabled} onChange={handleField} />
                                EPCS Enabled
                            </label>
                        </div>
                    </section>

                </div>

                {/* FOOTER */}
                <div className="flex justify-end gap-4 mt-10">
                    <button className="px-6 py-2 border rounded" onClick={onClose}>Cancel</button>
                    <button className="px-6 py-2 bg-indigo-600 text-white rounded" onClick={save}>
                        Save Prescriber
                    </button>
                </div>

            </div>
        </div>
    );
};

export default PrescriberDialog;
