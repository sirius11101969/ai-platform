import React from 'react'
import { AS6EmptyState } from './AS6EmptyState.jsx'

export function AS6DataTable({
  columns = [],
  rows = [],
  getRowKey = (_, index) => index,
  emptyTitle = 'Нет записей',
  emptyDescription = 'Данные появятся после заполнения источника.',
}) {
  if (!rows.length) {
    return <AS6EmptyState title={emptyTitle} description={emptyDescription} />
  }

  return (
    <div className="as6-data-table" role="region">
      <table>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key}>{column.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={getRowKey(row, index)}>
              {columns.map((column) => (
                <td key={column.key}>
                  {column.render ? column.render(row) : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default AS6DataTable
