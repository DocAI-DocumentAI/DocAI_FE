const EditDocument = () => {
  return (
    <div className="max-w-2xl p-8 mx-auto bg-white shadow rounded-2xl">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-2xl font-semibold">Edit Document</h2>
        <button className="text-2xl font-bold text-orange-300 hover:text-orange-500">
          &times;
        </button>
      </div>
      <p className="mb-6 text-gray-400">Create your documents</p>
      <div className="space-y-4">
        <div>
          <label className="block mb-1 text-gray-500">
            Document Name <span className="text-orange-400">*</span>
          </label>
          <input
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none"
            defaultValue="MEDICAL FILE"
          />
        </div>
        <div>
          <label className="block mb-1 text-gray-500">File</label>
          <input
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none"
            defaultValue="MEDICAL FILE.PDF"
          />
        </div>
      </div>
      <div className="bg-[#faf9f6] rounded-xl p-6 mt-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="block mb-1 text-gray-500">Title</label>
            <input className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none" />
          </div>
          <div className="row-span-2 md:col-span-1">
            <label className="block mb-1 text-gray-500">Summary</label>
            <textarea className="w-full rounded-lg border border-gray-200 px-4 py-2 min-h-[90px] focus:outline-none" />
          </div>
          <div>
            <label className="block mb-1 text-gray-500">Effective From</label>
            <input className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none" />
          </div>
          <div>
            <label className="block mb-1 text-gray-500">Effective Until</label>
            <input className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none" />
          </div>
          <div>
            <label className="block mb-1 text-gray-500">Tags</label>
            <input
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none"
              placeholder="City, Name Street Number, Unit"
            />
          </div>
        </div>
        <div className="flex justify-end mt-4">
          <button className="border border-orange-200 text-orange-400 rounded-xl px-6 py-1.5 mr-2 hover:bg-orange-50">
            Save
          </button>
        </div>
      </div>
      <div className="flex justify-end mt-6">
        <button className="px-8 py-2 font-semibold text-white bg-orange-200 rounded-xl hover:bg-orange-300">
          Continue
        </button>
      </div>
    </div>
  );
};

export default EditDocument;
