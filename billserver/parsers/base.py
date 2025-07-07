import pymupdf
import re

class BaseBillParser:
    """
    Simple base class for all bill parsers.
    """
    def __init__(self, pdf_path):
        self.pdf_path = pdf_path
        self.extracted_text = ""
        self.parsed_data = {}

    def extract_text(self):
        """
        Extract text from the PDF file.
        """
        doc = pymupdf.open(self.pdf_path)

        text = ""
        for page in doc:
            text += page.get_text()

        doc.close()
        self.extracted_text = text

        return self.extracted_text

    def parse(self):
        """
        Main parsing method that calls the other functions.
        """
        # Extract text from PDF
        self.extract_text()

        # Extract amount
        amount = self.extract_amount()

        # Store results
        self.parsed_data['amount'] = amount

        return self.parsed_data