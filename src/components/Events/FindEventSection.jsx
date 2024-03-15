import { useRef, useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { fetchEvents } from "../../util/http";
import LoadingIndicator from "../UI/LoadingIndicator";
import ErrorBlock from "../UI/ErrorBlock";
import EventItem from "./EventItem";

export default function FindEventSection() {
  const [searchTerm, setSearchTerm] = useState();

  const searchElement = useRef(); // here we are retrieve input by ref
  // but ref doesn't  trigged to re render component after change so if we change search term the data wil not sent

  // so overcome this problem i used useState here i m providing ref value to there so whenever ref changes
  // useState will trigged re render component and function execution

  // so why i not used only useState i can do that but as you know useState trigged re render component of every
  // key stroke so how many time we sent request if we search something that why i used  ref for obtaining
  // user input and then sent to state as per my view i can use here only state using debouncing if i don't want to use ref

  const { data, isPending, isError, error } = useQuery({
    queryKey: ["events", { search: searchTerm }],
    queryFn: ({ signal }) => fetchEvents({ signal, searchTerm }),
  });

  function handleSubmit(event) {
    event.preventDefault();
    setSearchTerm(searchElement.current.value);
  }

  let content = <p>please enter a search term to find Events</p>;

  if (isPending) {
    content = <LoadingIndicator />;
  }

  if (isError) {
    content = (
      <ErrorBlock
        title="An error Occurred"
        message={error.info?.message || "couldn't fetch Data"}
      />
    );
  }

  if (data) {
    content = (
      <ul>
        {data.map((event) => (
          <li key={event.id}>
            <EventItem event={event} />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <section className="content-section" id="all-events-section">
      <header>
        <h2>Find your next event!</h2>
        <form onSubmit={handleSubmit} id="search-form">
          <input
            type="search"
            placeholder="Search events"
            ref={searchElement}
          />
          <button>Search</button>
        </form>
      </header>
      {content}
    </section>
  );
}
