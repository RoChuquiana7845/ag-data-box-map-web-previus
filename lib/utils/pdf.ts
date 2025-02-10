import { jsPDF } from "jspdf"
import html2canvas from "html2canvas"

export async function exportToPdf(content: string): Promise<void> {
  try {
    // Create a temporary container for the content
    const container = document.createElement("div")
    container.innerHTML = content
    container.style.width = "800px"
    container.style.padding = "40px"
    container.style.position = "absolute"
    container.style.left = "-9999px"
    container.style.backgroundColor = "white"
    container.style.color = "black"

    // Add necessary styles for proper rendering
    const style = document.createElement("style")
    style.textContent = `
      * { font-family: Arial, sans-serif; }
      p { margin: 1em 0; line-height: 1.5; }
      img { max-width: 100%; height: auto; margin: 1em 0; }
      h1 { font-size: 24px; margin: 1em 0; }
      h2 { font-size: 20px; margin: 1em 0; }
      ul { margin: 1em 0; padding-left: 20px; }
      li { margin: 0.5em 0; }
    `
    container.appendChild(style)
    document.body.appendChild(container)

    // Wait for images to load
    const images = container.getElementsByTagName("img")
    await Promise.all(
      Array.from(images).map(
        (img) =>
          new Promise((resolve) => {
            if (img.complete) resolve(null)
            else img.onload = () => resolve(null)
          }),
      ),
    )

    // Convert the content to canvas with better quality
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "white",
      onclone: (clonedDoc) => {
        const clonedContainer = clonedDoc.body.firstChild as HTMLElement
        if (clonedContainer) {
          clonedContainer.style.transform = ""
          const clonedImages = clonedContainer.getElementsByTagName("img")
          Array.from(clonedImages).forEach((img) => {
            img.style.maxWidth = "100%"
            img.style.height = "auto"
          })
        }
      },
    })

    // Remove the temporary container
    document.body.removeChild(container)

    // Create PDF with better quality
    const imgWidth = 210 // A4 width in mm
    const pageHeight = 297 // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    const doc = new jsPDF("p", "mm")

    let heightLeft = imgHeight
    let position = 0
    let page = 1

    // Add image to first page
    doc.addImage(canvas, "PNG", 0, position, imgWidth, imgHeight)
    heightLeft -= pageHeight

    // Add subsequent pages if needed
    while (heightLeft >= 0) {
      doc.addPage()
      position = -pageHeight * page
      doc.addImage(canvas, "PNG", 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
      page++
    }

    // Save the PDF
    doc.save("reporte.pdf")
  } catch (error) {
    console.error("Error exporting to PDF:", error)
    throw error
  }
}

