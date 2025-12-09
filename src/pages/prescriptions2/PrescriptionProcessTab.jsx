import React, { useEffect, useState } from "react";
import axios from "axios";
import init from "../../init";
import PrescriptionFilter from "./PrescriptionFilter";
import Notification from "../../components/Notification";
import BarcodePreviewDialog from "../../components/BarcodePreviewDialog";
import ContactPrescriberDialog from "./ContactPrescriberDialog";
import { useUser } from "../../context/UserContext";
import { AlertCircle, Clock } from "lucide-react";

/**
 * TASKS PER WORKFLOW STEP
 */
const EXTRA_TASKS = {
    INTAKE_RECEIVED: [
        { code: "CONTACT_PRESCRIBER", label: "Contact Prescriber" }
    ],
    PHARMACIST_REVIEW: [
        { code: "PHARMACIST_NOTE", label: "Pharmacist Note" }
    ],
    FILL: [
        { code: "PRINT_BARCODE", label: "Print Barcode" }
    ],
    QA_CHECK: [],
    READY: []
};


// const headers = {
//     "Content-Type": "application/json",
//     Accept: "application/json",
// };

const PrescriptionProcessTab = () => {
    const { appUser } = useUser();

    const [notification, setNotification] = useState(null);
    const [queue, setQueue] = useState([]);

    const [prescriptions, setPrescriptions] = useState([]);
    const [filterQueue, setFilterQueue] = useState("");
    const [steps, setSteps] = useState([]);
    const [transitions, setTransitions] = useState([]);
    // Dialogs
    const [barcodeDialog, setBarcodeDialog] = useState({
        isOpen: false,
        prescriptionId: null,
        barcodeType: "code128"
    });

    const [prescriberDialog, setPrescriberDialog] = useState({
        isOpen: false,
        prescription: null
    });

    // -------------------------
    // Notification Auto-close
    // -------------------------
    useEffect(() => {
        if (notification) {
            const t = setTimeout(() => setNotification(null), 3000);
            return () => clearTimeout(t);
        }
    }, [notification]);

    const showNotification = (msg, type = "success") =>
        setNotification({ message: msg, type });

    // -------------------------
    // LOAD WORKFLOW + DATA
    // -------------------------
    const loadWorkflowSteps = async () => {
        const res = await axios.get(
            `/${init.appName}/api/workflow-steps/`,
            { headers: { "X-User-Email": appUser.email } }
        );
        setSteps(res.data?.content || []);
    };

    const loadTransitions = async () => {
        const res = await axios.get(
            `/${init.appName}/api/vworkflow-transitions?max=200`,
            { headers: { "X-User-Email": appUser.email } }
        );
        setTransitions(res.data || []);
    };

    const loadPrescriptionSummary = async () => {
        const res = await axios.get(
            `/${init.appName}/api/prescription-aggregate?max=200`,
            { headers: { "X-User-Email": appUser.email } }
        );
        setPrescriptions(res.data || []);
        const queues = [...new Set(res.data.map(d => d.activeQueueName))];
        setQueue(queues);
    };

    const goToNextStep = async (prescriptionId, fromStep, toStep) => {
        console.log(`goto next step ${fromStep}`);
        try {
            const res = await axios.post(
                `/${init.appName}/api/workflow/transition/`,
                {prescriptionId: prescriptionId, fromStep: fromStep, toStep: toStep},
                { headers: { "X-User-Email": appUser.email } }
            );
            console.log(res.status);
            console.log(`successfully move to next step ${fromStep}`);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        (async () => {
            await loadWorkflowSteps();
            await loadTransitions();
            await loadPrescriptionSummary();
        })();
    }, [appUser]);

    // -------------------------
    // FILTERED VIEW (by queue name)
    // -------------------------
    const filteredPrescriptions = prescriptions.filter((rx) =>
        !filterQueue
            ? true
            : rx.activeQueueName === filterQueue);


    // -------------------------
    // TASK DIALOG HANDLERS
    // -------------------------
    const openPrescriberDialog = (prescription) => {
        setPrescriberDialog({
            isOpen: true,
            prescription
        });
    };

    const closePrescriberDialog = () => {
        setPrescriberDialog({ isOpen: false, prescription: null });
    };

    const sendPrescriberMessage = async (payload) => {
        try {
            await axios.post(
                `/${init.appName}/api/prescriber/contact`,
                payload,
                { headers }
            );
            showNotification("Message sent to prescriber.");
            closePrescriberDialog();
        } catch (err) {
            console.error(err);
            showNotification("Failed to send message.", "error");
        }
    };

    const openBarcodeDialog = (prescriptionId, barcodeType = "code128") => {
        setBarcodeDialog({ isOpen: true, prescriptionId, barcodeType });
    };

    const closeBarcodeDialog = () => {
        setBarcodeDialog({
            isOpen: false,
            prescriptionId: null,
            barcodeType: "code128"
        });
    };

    // -------------------------
    // WORKFLOW ACTIONS
    // -------------------------

    const moveToNextStep = async (item, step) => {
        const transition = transitions.find(t => t.fromStep === item.currentStep);
        if (!transition) {
            showNotification("No transition available.", "error");
            return;
        }

        try {

            showNotification(`Moved to ${step}`);
            await goToNextStep(item.prescriptionId, item.currentStep, step);

            // Refresh
            await loadPrescriptionSummary();
        } catch (err) {
            console.error(err);
            showNotification("Transition failed.", "error");
        }
    };

    const runTask = (item, task) => {
        switch (task.code) {
            case "CONTACT_PRESCRIBER":
                openPrescriberDialog({
                    prescriptionId: item.prescriptionItemId,
                    prescriberId: item.prescriberId,
                    prescriberName: item.prescriberName
                });
                break;

            case "PRINT_BARCODE":
                openBarcodeDialog(item.prescriptionItemId, "code128");
                break;

            case "PHARMACIST_NOTE":
                alert("Pharmacist note dialog not yet implemented");
                break;
        }
    };

    // -------------------------
    // STEP COLORS (optional)
    // -------------------------
    const getPriorityIcon = (priority) => {
        if (priority === "urgent")
            return <AlertCircle className="text-red-500" size={16} />;
        if (priority === "high")
            return <Clock className="text-orange-500" size={16} />;
        return <Clock className="text-gray-400" size={16} />;
    };


    const getWorkflowStepColor = (wokflowStepId) => {
        const colors = {
            INTAKE_RECEIVED: 'bg-purple-600 hover:bg-purple-700 text-white',
            "PHARMACIST_REVIEW": 'bg-yellow-100 text-yellow-800 border-yellow-300',
            "FILL": 'bg-orange-100 text-blue-800 border-blue-300',
            "QA_CHECK": 'bg-amber-100 text-green-800 border-green-300',
            "PICKUP_READY": 'bg-lime-100  text-orange-800 border-orange-300',
            "CANCELLED": 'bg-teal-100 text-red-800 border-red-300',
            "COMPLETED": 'bg-blue-100 text-blue-800 border-blue-300',
        };
        return colors[wokflowStepId] || 'bg-gray-100 text-gray-800 border-gray-300';
    };


    const getNextWorkflowStepColor = (wokflowStepId) => {
        const colors = {
            PHARMACIST_REVIEW: 'bg-yellow-100 text-yellow-800 border-yellow-300',
            FILL: 'bg-orange-100 text-blue-800 border-blue-300',
            QA_CHECK: 'bg-amber-100 text-green-800 border-green-300',
            PICKUP_READY: 'bg-lime-100  text-orange-800 border-orange-300',
            CANCELLED: 'bg-teal-100 text-red-800 border-red-300',
            COMPLETED: 'bg-blue-100 text-blue-800 border-blue-300',
        };
        return colors[wokflowStepId] || 'bg-gray-100 text-gray-800 border-gray-300';
    };

    const DrugInfoComponent = ({ prescription }) => {
        return (
            <div>
                {prescription.items.map(rx => {
                    return (
                        <div className="grid grid-cols-3 gap-4 mb-4" key={rx.inventoryItemId}>
                            <div>
                                <div className="text-xs text-gray-500 mb-1">Drug</div>
                                <div className="font-medium">
                                    {rx?.name} {rx?.strength}
                                </div>
                            </div>
                            <div>
                                <div className="text-xs text-gray-500 mb-1">Copay</div>
                                <div className="text-sm text-gray-700">${rx.copay || 0}</div>
                            </div>
                            <div>
                                <div className="text-xs text-gray-500 mb-1">SIG</div>
                                <div className="font-medium">{rx?.sig}</div>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    const InsuranceInfoComponent = ({ prescription }) => {
        return (
            <div>
                {prescription.insurances.map(insurance => {
                    const type = (insurance.isPrimary) ? 'Primary' : (insurance.isSecondary) ? 'Secondary' : 'Ternary';
                    return (
                        <div className="grid grid-cols-3 gap-4 mb-4" key={insurance.planName}>
                            <div>
                                <div className="text-xs text-gray-500 mb-1">Plan</div>
                                <div className="font-medium">{insurance.planName}</div>
                            </div>
                            <div>
                                <div className="text-xs text-gray-500 mb-1">Insurance Type</div>
                                <div className="font-medium">{type}</div>
                            </div>
                            <div>
                                <div className="text-xs text-gray-500 mb-1">Group #</div>
                                <div className="font-medium">{insurance.groupNumber}</div>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    const NextStepComponent = ({ item }) => {
        const transition = transitions.find(t => t.fromStep === item.currentStep);
        if (!transition) {
            showNotification("No transition available.", "error");
            return;
        }
        filteredToSteps = transition.toSteps.filter(step => step !== item.currentStep);
        filteredToSteps.map(step => {
            return (
                <button
                    key={step}
                    onClick={() => moveToNextStep(item)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm"
                >
                    Move to {step}
                </button>
            )
        }
        );
    }

    // -------------------------
    // UI RENDER
    // -------------------------
    return (
        <div>
            {notification && <Notification notification={notification} />}

            {/* Filter Bar */}
            {queue && <PrescriptionFilter
                data={prescriptions}
                filterList={queue}
                filterStatus={filterQueue}
                setFilterStatus={setFilterQueue}
            />}

            <div className="grid gap-4 mt-4">
                {
                    filteredPrescriptions.map(item => {
                        const tasks = EXTRA_TASKS[item.currentStep] || [];
                        const transition = transitions.find(t => t.fromStep === item.currentStep);

                        const toSteps = transition.toSteps.filter(step => step != item.currentStep) || [];
                        // console.log(toSteps);
                        return (
                            <div
                                key={item.prescriptionId}
                                className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md"
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-3">
                                        {getPriorityIcon(item.priority)}
                                        <div>
                                            <div className={`px-2 py-1 rounded text-xs font-medium border ${getWorkflowStepColor(item.currentStep)}`}>
                                                {item.currentStep.replace(`_`, ` `)}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                Status: {item.currentStatus.replace(`_`, ` `)}
                                            </div>
                                        </div>
                                    </div>
                                </div>


                                {/* Core Info */}
                                <div className="grid grid-cols-3 gap-4 mb-4">
                                    <div>
                                        <div className="text-xs text-gray-500 mb-1">
                                            Patient
                                        </div>
                                        <div className="font-medium">
                                            {item.patientFirstName} {item.patientLastName}
                                        </div>
                                    </div>

                                    <div>
                                        <div className="text-xs text-gray-500 mb-1">
                                            Presciber
                                        </div>
                                        <div className="font-medium">
                                            {item.prescriberFirstName} {item.prescriberLastName}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-500 mb-1">
                                            Clinic
                                        </div>
                                        <div className="font-medium">
                                            {item.prescriberFirstName} {item.clinicName}
                                        </div>
                                    </div>
                                </div>

                                {/** insurance info */}
                                <InsuranceInfoComponent prescription={item} />

                                {/** drug info */}
                                <DrugInfoComponent prescription={item} />


                                {/* Actions */}
                                <div className="flex gap-2">

                                    {/* Task Buttons */}
                                    {tasks.map(task => (

                                        <button
                                            key={task.code}
                                            onClick={() => runTask(item, task)}
                                            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm"
                                        >
                                            {task.label}
                                        </button>

                                    ))}

                                    {/* Workflow Transition Button */}
                                    {toSteps.map(step => {
                                        return (
                                            <button
                                                key={step}
                                                onClick={() => moveToNextStep(item, step)}
                                                className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${getNextWorkflowStepColor(step)}`}
                                            >
                                                Move To {step.replace(`_`, ` `)}
                                            </button>

                                        )
                                    })}
                                </div>
                            </div>
                        )
                    }
                    )}
            </div>

            {/* Dialogs */}
            <BarcodePreviewDialog
                isOpen={barcodeDialog.isOpen}
                prescriptionId={barcodeDialog.prescriptionId}
                barcodeType={barcodeDialog.barcodeType}
                onClose={closeBarcodeDialog}
            />

            <ContactPrescriberDialog
                isOpen={prescriberDialog.isOpen}
                prescription={prescriberDialog.prescription}
                onClose={closePrescriberDialog}
                onSubmit={sendPrescriberMessage}
            />
        </div>
    );
};

export default PrescriptionProcessTab;
