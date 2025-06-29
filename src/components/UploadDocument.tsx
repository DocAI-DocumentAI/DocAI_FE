"use client"
const UploadDocument = () => {
    return (
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow p-8">
            <div className="flex justify-between items-center mb-2">
                <h2 className="text-2xl font-semibold">Upload Document</h2>
                <button className="text-orange-300 text-2xl font-bold hover:text-orange-500">&times;</button>
            </div>
            <p className="text-gray-400 mb-6">Create your documents</p>
            <div className="space-y-4">
                <div>
                    <label className="block text-gray-500 mb-1">Document Name <span className="text-orange-400">*</span></label>
                    <input className="w-full rounded-lg border border-gray-200 px-4 py-2 focus:outline-none" placeholder="Search by Name or Email" />
                </div>
                <div>
                    <label className="block text-gray-500 mb-1">File</label>
                    <input className="w-full rounded-lg border border-gray-200 px-4 py-2 focus:outline-none" placeholder="PDF/DOCX" />
                </div>
            </div>
            <div className="bg-[#faf9f6] rounded-xl p-6 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-gray-500 mb-1">Title</label>
                        <input className="w-full rounded-lg border border-gray-200 px-4 py-2 focus:outline-none" />
                    </div>
                    <div className="md:col-span-1 row-span-2">
                        <label className="block text-gray-500 mb-1">Summary</label>
                        <textarea className="w-full rounded-lg border border-gray-200 px-4 py-2 min-h-[90px] focus:outline-none" />
                    </div>
                    <div>
                        <label className="block text-gray-500 mb-1">Effective From</label>
                        <input className="w-full rounded-lg border border-gray-200 px-4 py-2 focus:outline-none" />
                    </div>
                    <div>
                        <label className="block text-gray-500 mb-1">Effective Until</label>
                        <input className="w-full rounded-lg border border-gray-200 px-4 py-2 focus:outline-none" />
                    </div>
                    <div>
                        <label className="block text-gray-500 mb-1">Tags</label>
                        <input className="w-full rounded-lg border border-gray-200 px-4 py-2 focus:outline-none" />
                    </div>
                </div>
                <div className="flex justify-end mt-4">
                    <button className="border border-orange-200 text-orange-400 rounded-xl px-6 py-1.5 mr-2 hover:bg-orange-50">Save</button>
                </div>
            </div>
            <div className="flex justify-end mt-6">
                <button className="bg-orange-200 text-white rounded-xl px-8 py-2 font-semibold hover:bg-orange-300">Continue</button>
            </div>
        </div>
    );
};

export default UploadDocument;