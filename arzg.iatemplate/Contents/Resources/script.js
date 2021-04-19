var documentBody = document.querySelector("[data-document]");

documentBody.addEventListener("ia-writer-change", function () {
  const bibliography = getBibliography();
  if (bibliography != null) {
    updateCitationsAndBibliography(bibliography);
  }

  wrapAcronymsInAbbrTag();
});

function wrapAcronymsInAbbrTag() {
  documentBody.innerHTML = documentBody.innerHTML.replace(
    /[A-Z][A-Z]+/g,
    (acronym) => `<abbr>${acronym}</abbr>`
  );
}

function updateCitationsAndBibliography(bibliography) {
  var citationIdx = 1;
  var alreadyReferencedKeys = [];

  documentBody.innerHTML = documentBody.innerHTML.replace(
    /@[a-z]+/g,
    (citationText) => {
      const renderedCitation = renderCitation(
        citationText,
        citationIdx,
        bibliography,
        // work-around to force pass-by-reference
        { value: alreadyReferencedKeys }
      );
      citationIdx++;

      return renderedCitation;
    }
  );

  documentBody.innerHTML = `${documentBody.innerHTML}${renderBibliography(
    bibliography
  )}`;

  deleteBibliography();
}

function renderCitation(
  citationText,
  citationIdx,
  bibliography,
  alreadyReferencedKeys
) {
  const citationKey = citationText.substring(1);

  const matchingReference = bibliography.references.find(
    (reference) => reference.key == citationKey
  );

  if (matchingReference == null) {
    return `<span style="color: red">${citationText}</span>`;
  } else {
    const alreadyCited = alreadyReferencedKeys.value.includes(citationKey);

    const renderedReference = alreadyCited
      ? renderReferenceShort(matchingReference)
      : renderReference(matchingReference);

    const output = `<sup>${citationIdx}</sup><span class="citation"><span class="citation-idx">${citationIdx}</span>${renderedReference}</span>`;

    alreadyReferencedKeys.value.push(citationKey);

    return output;
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
  var output = `${renderAuthorFull(reference.authorNames)}.`;

  if (reference.journalName) {
    output += ` ‘${reference.title}’ in <em>${reference.journalName}.</em>`;
  } else {
    output += ` <em>${reference.title}.</em>`;
  }

  output += ` ${reference.date}.`;

  if (reference.pages) {
    output += ` pp.\u00A0${reference.pages.start}–${reference.pages.end}.`;
  }

  if (reference.url) {
    output += ` Available at <a href=${reference.url}>${reference.url}</a>.`;
  }

  return output;
}

function renderReferenceShort(reference) {
  return `${renderAuthorSurname(reference.authorNames)}.`;
}

function renderAuthorFull(authorNames) {
  var output = "";

  const givenNames = authorNames.slice(0, authorNames.length - 1);
  for (const givenName of givenNames) {
    output += `${givenName[0]}. `;
  }

  output += renderAuthorSurname(authorNames);

  return output;
}

function renderAuthorSurname(authorNames) {
  return authorNames[authorNames.length - 1];
}

function getBibliography() {
  const bibliography = getBibliographyElement();

  if (bibliography == null) {
    return null;
  }

  const list = bibliography.getElementsByTagName("ul")[0];

  return {
    references: [...list.children]
      .map((reference) => {
        const fields = reference.textContent.split("|").reverse();

        const key = fields.pop().trim();

        const authorNames = fields
          .pop()
          .trim()
          .split(" ")
          // use • to keep author names together
          .map((name) => name.replace(/•/g, " "));

        const title = fields.pop().trim();

        const date = fields.pop().trim();

        var url = null;

        var lastField = fields[fields.length - 1];
        if (lastField && lastField.trim().startsWith("http")) {
          url = fields.pop().trim();
        }

        var pages = null;

        var lastField = fields[fields.length - 1];
        if (lastField && lastField.trim().includes("..")) {
          const text = fields.pop().split("..");
          pages = {
            start: text[0].trim(),
            end: text[1].trim(),
          };
        }

        var journalName = null;
        if (fields[fields.length - 1]) {
          journalName = fields.pop().trim();
        }

        return {
          key,
          authorNames,
          title,
          date,
          url,
          pages,
          journalName,
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
