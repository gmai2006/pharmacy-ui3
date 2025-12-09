import { Filter } from "lucide-react";

const PrescriptionFilter = ({data, filterList, filterStatus, setFilterStatus}) => {
    return (
          <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
                <div className="flex items-center gap-4">
                    <Filter size={18} className="text-gray-400" />
                    <button
                        onClick={() => setFilterStatus('')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filterStatus === '' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        All ({data.length})
                    </button>
                    {
                        filterList.map(queue => (
                            (
                                <button key={queue}
                                    onClick={() => setFilterStatus(queue)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filterStatus === queue ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    {queue.replace(`_`, ` `)} ({data.filter(pre => pre.activeQueueName === queue).length})
                                </button>
                            )
                        ))
                    }

                </div>
            </div>
    )
};
export default PrescriptionFilter;