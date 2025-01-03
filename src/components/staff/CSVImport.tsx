import { useState, useRef } from 'react';
    import { Button } from '@/components/ui/Button';
    import { Upload, X, Check, AlertCircle, Download } from 'lucide-react';
    import { ParaPro } from '@/types';
    import Papa from 'papaparse';

    interface CSVRow {
      name: string;
      email: string;
      type: string;
    }

    interface ImportPreview {
      valid: CSVRow[];
      invalid: { row: CSVRow; errors: string[] }[];
      duplicates: { row: CSVRow; existing: ParaPro }[];
    }

    interface CSVImportProps {
      existingParapros: ParaPro[];
      onImport: (parapros: Omit<ParaPro, 'id' | 'order'>[]) => void;
      onClose: () => void;
    }

    export function CSVImport({ existingParapros, onImport, onClose }: CSVImportProps) {
      const [preview, setPreview] = useState<ImportPreview | null>(null);
      const fileInputRef = useRef<HTMLInputElement>(null);

      const validateRow = (row: any): string[] => {
        const errors: string[] = [];
        
        if (!row.name?.trim()) {
          errors.push('Name is required');
        }
        
        if (!row.email?.trim()) {
          errors.push('Email is required');
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email)) {
          errors.push('Invalid email format');
        }
        
        if (!['returner', 'new'].includes(row.type?.toLowerCase())) {
          errors.push('Type must be either "returner" or "new"');
        }
        
        return errors;
      };

      const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          transformHeader: (header) => header.toLowerCase().trim(),
          complete: (results) => {
            const valid: CSVRow[] = [];
            const invalid: { row: CSVRow; errors: string[] }[] = [];
            const duplicates: { row: CSVRow; existing: ParaPro }[] = [];

            results.data.forEach((row: any) => {
              const normalizedRow = {
                name: row.name?.trim(),
                email: row.email?.trim(),
                type: row.type?.toLowerCase(),
              };

              const errors = validateRow(normalizedRow);
              const existing = existingParapros.find(p => 
                p.email.toLowerCase() === normalizedRow.email.toLowerCase()
              );

              if (errors.length > 0) {
                invalid.push({ row: normalizedRow, errors });
              } else if (existing) {
                duplicates.push({ row: normalizedRow, existing });
              } else {
                valid.push(normalizedRow);
              }
            });

            setPreview({ valid, invalid, duplicates });
          },
          error: (error) => {
            console.error('CSV Parse Error:', error);
          },
        });
      };

      const handleImport = () => {
        if (!preview?.valid.length) return;
        
        const paraprosToImport = preview.valid.map(row => ({
          name: row.name,
          email: row.email,
          type: row.type as 'returner' | 'new',
        }));

        console.log('Importing ParaPros:', paraprosToImport); // Debug log
        onImport(paraprosToImport);
        onClose();
      };

      const handleDownloadTemplate = () => {
        const headers = ['name', 'email', 'type'];
        const csv = headers.join(',') + '\n';
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'staff-template.csv';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      };

      return (
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-lg">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Import Staff from CSV</h3>
            <div className="flex space-x-2">
              <Button
                onClick={handleDownloadTemplate}
                variant="outline"
                size="sm"
              >
                <Download className="h-4 w-4" />
                Template
              </Button>
              <button
                onClick={onClose}
                className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {!preview ? (
            <div className="space-y-4">
              <div className="rounded-lg border-2 border-dashed border-gray-300 p-6">
                <div className="text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-4">
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      variant="outline"
                    >
                      Select CSV File
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </div>
                  <div className="mt-4 space-y-2 text-sm text-gray-500">
                    <p className="font-medium">Required CSV Format:</p>
                    <ul className="list-inside list-disc">
                      <li>Headers: name, email, type</li>
                      <li>Type must be either "returner" or "new"</li>
                      <li>Email must be a valid email address</li>
                    </ul>
                    <p className="mt-2 text-xs">
                      Example: name,email,type
                      <br />
                      John Smith,john@example.com,returner
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {preview.valid.length > 0 && (
                <div className="rounded-md bg-green-50 p-4">
                  <div className="flex">
                    <Check className="h-5 w-5 text-green-400" />
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-green-800">
                        {preview.valid.length} valid records ready to import
                      </h3>
                    </div>
                  </div>
                </div>
              )}

              {(preview.invalid.length > 0 || preview.duplicates.length > 0) && (
                <div className="rounded-md bg-yellow-50 p-4">
                  <div className="flex">
                    <AlertCircle className="h-5 w-5 text-yellow-400" />
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800">
                        Found {preview.invalid.length} invalid and {preview.duplicates.length} duplicate records
                      </h3>
                    </div>
                  </div>
                </div>
              )}

              <div className="max-h-96 overflow-y-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {preview.valid.map((row, index) => (
                      <tr key={`valid-${index}`} className="bg-green-50">
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                          {row.name}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                          {row.email}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                          {row.type}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-green-600">
                          Valid
                        </td>
                      </tr>
                    ))}
                    {preview.invalid.map(({ row, errors }, index) => (
                      <tr key={`invalid-${index}`} className="bg-red-50">
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                          {row.name}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                          {row.email}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                          {row.type}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-red-600">
                          {errors.join(', ')}
                        </td>
                      </tr>
                    ))}
                    {preview.duplicates.map(({ row }, index) => (
                      <tr key={`duplicate-${index}`} className="bg-yellow-50">
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                          {row.name}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                          {row.email}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                          {row.type}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-yellow-600">
                          Duplicate email
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end space-x-3">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  onClick={handleImport}
                  disabled={preview.valid.length === 0}
                >
                  Import {preview.valid.length} Records
                </Button>
              </div>
            </div>
          )}
        </div>
      );
    }
