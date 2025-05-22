 
import { useState } from "react"
import { Filter, FileText, FileBarChart, Scale, FileCheck, FileSpreadsheet } from "lucide-react"

export function SearchFilter() {
  const [startDate, setStartDate] = useState("12/03/2019")
  const [endDate, setEndDate] = useState("12/03/2020")
  const [selectedQuarter, setSelectedQuarter] = useState("4")
  const [selectedYear, setSelectedYear] = useState("2023")
  const [selectedCreator, setSelectedCreator] = useState("Nguyễn Văn B")

  return (
    <div className="w-60 rounded-md border border-gray-200 bg-white">
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center">
          <Filter className="mr-2 h-4 w-4" />
          <h2 className="font-medium">Filter</h2>
        </div>
      </div>

      <div className="p-4">
        <h3 className="mb-2 text-xs font-medium uppercase text-gray-500">Document type</h3>
        <div className="space-y-2">
          <div className="flex items-center">
            <input type="checkbox" id="instructions" className="h-4 w-4 rounded border-gray-300" />
            <label htmlFor="instructions" className="ml-2 flex items-center text-sm">
              <FileText className="mr-2 h-4 w-4 text-gray-500" /> Instructions
            </label>
          </div>
          <div className="flex items-center">
            <input type="checkbox" id="reports" className="h-4 w-4 rounded border-gray-300" defaultChecked />
            <label htmlFor="reports" className="ml-2 flex items-center text-sm">
              <FileBarChart className="mr-2 h-4 w-4 text-gray-500" /> Reports
            </label>
          </div>
          <div className="flex items-center">
            <input type="checkbox" id="laws" className="h-4 w-4 rounded border-gray-300" />
            <label htmlFor="laws" className="ml-2 flex items-center text-sm">
              <Scale className="mr-2 h-4 w-4 text-gray-500" /> Laws
            </label>
          </div>
          <div className="flex items-center">
            <input type="checkbox" id="plans" className="h-4 w-4 rounded border-gray-300" />
            <label htmlFor="plans" className="ml-2 flex items-center text-sm">
              <FileCheck className="mr-2 h-4 w-4 text-gray-500" /> Plans
            </label>
          </div>
          <div className="flex items-center">
            <input type="checkbox" id="minutes" className="h-4 w-4 rounded border-gray-300" />
            <label htmlFor="minutes" className="ml-2 flex items-center text-sm">
              <FileSpreadsheet className="mr-2 h-4 w-4 text-gray-500" /> Handover minutes
            </label>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 p-4">
        <h3 className="mb-2 text-xs font-medium uppercase text-gray-500">Date</h3>

        <div className="mb-4">
          <div className="mb-1 text-sm">Quarter</div>
          <div className="flex gap-2">
            <button
              className={`flex h-8 w-8 items-center justify-center rounded-md border ${selectedQuarter === "1" ? "border-blue-500 bg-blue-50" : "border-gray-300"}`}
              onClick={() => setSelectedQuarter("1")}
            >
              1
            </button>
            <button
              className={`flex h-8 w-8 items-center justify-center rounded-md border ${selectedQuarter === "2" ? "border-blue-500 bg-blue-50" : "border-gray-300"}`}
              onClick={() => setSelectedQuarter("2")}
            >
              2
            </button>
            <button
              className={`flex h-8 w-8 items-center justify-center rounded-md border ${selectedQuarter === "3" ? "border-blue-500 bg-blue-50" : "border-gray-300"}`}
              onClick={() => setSelectedQuarter("3")}
            >
              3
            </button>
            <button
              className={`flex h-8 w-8 items-center justify-center rounded-md border ${selectedQuarter === "4" ? "border-blue-500 bg-blue-50" : "border-gray-300"}`}
              onClick={() => setSelectedQuarter("4")}
            >
              4
            </button>
          </div>
        </div>

        <div className="mb-4">
          <div className="mb-1 text-sm">Year</div>
          <div className="flex gap-2">
            <input
              type="text"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-1 text-sm"
            />
          </div>
        </div>

        <div className="mb-4">
          <div className="mb-1 text-sm">Date range</div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-1 text-sm"
            />
            <span className="text-sm">to</span>
            <input
              type="text"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-1 text-sm"
            />
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 p-4">
        <h3 className="mb-2 text-xs font-medium uppercase text-gray-500">Creator</h3>
        <select
          value={selectedCreator}
          onChange={(e) => setSelectedCreator(e.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-1 text-sm"
        >
          <option value="Nguyễn Văn B">Nguyễn Văn B</option>
          <option value="Trần Văn A">Trần Văn A</option>
          <option value="Lê Thị C">Lê Thị C</option>
        </select>
      </div>
    </div>
  )
}
