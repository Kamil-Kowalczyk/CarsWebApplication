import type { ChangeEvent } from "react"

export interface SearchBarProps {
    handleChange: (e: ChangeEvent<HTMLInputElement>) => void
    handleClick: () => void
    searchedText: string
}

export const SearchBar = ({searchedText, handleChange, handleClick}: SearchBarProps) => {
    return (
        <div className="search-bar">
        <input
          type="text"
          placeholder="Filter cars by brand or model..."
          value={searchedText}
          onChange={handleChange}
        />
        {searchedText && (
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handleClick}
          >
            Clear
          </button>
        )}
      </div>
    )
}

export default SearchBar