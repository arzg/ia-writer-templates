var documentBody = document.querySelector("[data-document]");

documentBody.addEventListener("ia-writer-change", function () {
  const bibliography = getBibliography();
  var citationIdx = 1;

  documentBody.innerHTML = documentBody.innerHTML.replace(
    /@[a-z]+/g,
    (citationText) => {
      const renderedCitation = renderCitation(
        citationText,
        citationIdx,
        bibliography
      );
      citationIdx++;

      return renderedCitation;
    }
  );

  documentBody.innerHTML = `${documentBody.innerHTML}${renderBibliography(
    bibliography
  )}`;

  deleteBibliography();
});

function renderCitation(citationText, citationIdx, bibliography) {
  const citationKey = citationText.substring(1);

  const matchingReference = bibliography.references.find(
    (reference) => reference.key == citationKey
  );

  if (matchingReference == null) {
    return `<span style="color: red">${citationText}</span>`;
  } else {
    return `<sup>${citationIdx}</sup><span class="citation">${citationIdx}: ${renderReference(
      matchingReference
    )}</span>`;
  }
}

function renderBibliography(bibliography) {
  var output = "<h2>Bibliography</h2>";

  output += "<ul>";
  for (const reference of bibliography.references) {
    output += `<li>${renderReference(reference)}</li>`;
  }
  output += "</ul>";

  return output;
}

function renderReference(reference) {
  return `${renderAuthor(reference.authorNames)}. <em>${
    reference.title
  }.</em> ${reference.date}.`;
}

function renderAuthor(authorNames) {
  var output = "";

  const givenNames = authorNames.slice(0, authorNames.length - 1);
  for (const givenName of givenNames) {
    output += `${givenName[0]}. `;
  }

  const lastName = authorNames[authorNames.length - 1];
  output += lastName;

  return output;
}

function getBibliography() {
  const list = getBibliographyElement().getElementsByTagName("ul")[0];

  return {
    references: [...list.children]
      .map((reference) => {
        const fields = reference.textContent.split("|");

        return {
          key: fields[0].trim(),
          authorNames: fields[1].trim().split(" "),
          title: fields[2].trim(),
          date: fields[3].trim(),
        };
      })
      .sort((ref1, ref2) => {
        const lastName = (reference) =>
          reference.authorNames[reference.authorNames.length - 1];

        return lastName(ref1).localeCompare(lastName(ref2));
      }),
  };
}

function deleteBibliography() {
  getBibliographyElement().remove();
}

function getBibliographyElement() {
  return document.getElementById("bib");
}
