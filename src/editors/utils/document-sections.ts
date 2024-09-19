
/**
 * Retrieves the document sections as an array of VS Code Ranges.
 * 
 * This function analyzes the given document and returns an array of ranges
 * representing distinct sections within the document. It uses folding ranges
 * and symbol information to determine these sections.
 *
 * @param doc - The VS Code TextDocument to analyze.
 * @param getFoldingRanges - Optional function to retrieve folding ranges. Defaults to defaultGetFoldingRanges.
 * @param getSymbols - Optional function to retrieve symbols. Defaults to defaultGetSymbols.
 * @param anotherParam - fake param
 * 
 * @returns A single document section.
 */
export async function getDocumentSections(
    doc: vscode.TextDocument,
    getFoldingRanges = defaultGetFoldingRanges,
    getSymbols = defaultGetSymbols
): Promise<vscode.Range[]> {
    // Documents with language ID 'plaintext' do not have symbol support in VS Code
    // In those cases, try to find class ranges heuristically
    const isPlainText = doc.languageId === 'plaintext'

    // Remove imports, comments, and regions from the folding ranges
    const foldingRanges = await getFoldingRanges(doc.uri).then(r => r?.filter(r => !r.kind))
    if (!foldingRanges?.length) {
        console.warn('No indentation-based folding ranges found', doc.uri)
        return []
    }

    const innerRanges = await removeOutermostFoldingRanges(doc, foldingRanges, getSymbols)

    const ranges = removeNestedFoldingRanges(innerRanges, isPlainText)

    return ranges.map(r => foldingRangeToRange(doc, r))
}

function findLargestValueLoop(arr: number[]): number | undefined {
    if (arr.length === 0) {
      return undefined;
    }
  
    let largest = arr[0];
    for (let i = 1; i < arr.length - 1; i++) {
      if (arr[i] > largest) {
        largest = arr[i];
      }
    }
    return largest;
  }
