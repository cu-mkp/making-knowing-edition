#!/usr/bin/env python3
"""
HTML Structure Validator for Making and Knowing Edition

This script validates the HTML structure of essays, checking for proper
formatting, required elements, and content organization.
"""

import json
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Optional, Tuple
import sys
from bs4 import BeautifulSoup, NavigableString
import re


class StructureValidator:
    def __init__(self):
        self.base_dir = Path(__file__).parent.parent
        self.annotations_dir = self.base_dir / "public" / "bnf-ms-fr-640" / "staging061825-0" / "annotations"
        self.issues = []
        self.stats = {
            'total_essays': 0,
            'valid_structure': 0,
            'missing_titles': 0,
            'missing_abstracts': 0,
            'missing_content': 0,
            'broken_images': 0,
            'malformed_html': 0
        }
        
    def log_issue(self, severity: str, essay_id: str, element: str, issue: str):
        """Log a structure validation issue"""
        self.issues.append({
            'severity': severity,
            'essay_id': essay_id,
            'element': element,
            'issue': issue,
            'timestamp': datetime.now().isoformat()
        })
        
    def load_annotations(self) -> Optional[List[Dict]]:
        """Load annotations manifest"""
        manifest_path = self.annotations_dir / "annotations.json"
        
        if not manifest_path.exists():
            print(f"❌ Annotations manifest not found: {manifest_path}")
            return None
            
        try:
            with open(manifest_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                return data.get('content', [])
        except Exception as e:
            print(f"❌ Error loading annotations: {e}")
            return None
            
    def parse_html(self, essay_id: str) -> Optional[BeautifulSoup]:
        """Parse HTML file and return BeautifulSoup object"""
        html_path = self.annotations_dir / f"{essay_id}.html"
        
        if not html_path.exists():
            self.log_issue('CRITICAL', essay_id, 'file', 'HTML file does not exist')
            return None
            
        try:
            with open(html_path, 'r', encoding='utf-8') as f:
                content = f.read()
                
            # Parse with BeautifulSoup
            soup = BeautifulSoup(content, 'html.parser')
            
            # Basic HTML validation
            if not soup.find('body'):
                self.log_issue('ERROR', essay_id, 'html', 'No <body> tag found')
                
            return soup
            
        except Exception as e:
            self.log_issue('CRITICAL', essay_id, 'parsing', f'Failed to parse HTML: {e}')
            return None
            
    def validate_title_structure(self, soup: BeautifulSoup, essay_id: str) -> bool:
        """Validate title and heading structure"""
        valid = True
        
        # Check for main title (h1 or h2)
        title_tags = soup.find_all(['h1', 'h2'])
        if not title_tags:
            self.log_issue('ERROR', essay_id, 'title', 'No main title (h1 or h2) found')
            valid = False
        else:
            # Check if first heading is substantial
            first_title = title_tags[0]
            title_text = first_title.get_text(strip=True)
            if len(title_text) < 10:
                self.log_issue('WARNING', essay_id, 'title', f'Title seems too short: "{title_text}"')
                
        # Check heading hierarchy
        headings = soup.find_all(['h1', 'h2', 'h3', 'h4', 'h5', 'h6'])
        for i, heading in enumerate(headings):
            level = int(heading.name[1])
            if i > 0:
                prev_level = int(headings[i-1].name[1])
                if level > prev_level + 1:
                    self.log_issue('WARNING', essay_id, 'headings', 
                                 f'Heading hierarchy skip: {headings[i-1].name} to {heading.name}')
                    
        return valid
        
    def validate_content_structure(self, soup: BeautifulSoup, essay_id: str) -> bool:
        """Validate main content structure"""
        valid = True
        
        # Check for paragraphs
        paragraphs = soup.find_all('p')
        if len(paragraphs) < 3:
            self.log_issue('WARNING', essay_id, 'content', f'Very few paragraphs found: {len(paragraphs)}')
            
        # Check for substantial text content
        body_text = soup.get_text(strip=True)
        word_count = len(body_text.split())
        
        if word_count < 500:
            self.log_issue('WARNING', essay_id, 'content', f'Low word count: {word_count} words')
        elif word_count > 20000:
            self.log_issue('INFO', essay_id, 'content', f'Very long essay: {word_count} words')
            
        # Check for footnotes or citations
        footnotes = soup.find_all(['sup', 'a'], class_=re.compile(r'footnote|citation'))
        if not footnotes:
            # Alternative check for citation patterns
            citation_pattern = re.compile(r'\[\d+\]|<sup>\d+</sup>|footnote', re.IGNORECASE)
            if not citation_pattern.search(str(soup)):
                self.log_issue('INFO', essay_id, 'citations', 'No footnotes or citations detected')
                
        return valid
        
    def validate_images_and_figures(self, soup: BeautifulSoup, essay_id: str) -> bool:
        """Validate image and figure elements"""
        valid = True
        
        # Check images
        images = soup.find_all('img')
        for i, img in enumerate(images):
            img_src = img.get('src', '')
            img_alt = img.get('alt', '')
            
            # Check src attribute
            if not img_src:
                self.log_issue('ERROR', essay_id, 'image', f'Image {i+1} missing src attribute')
                valid = False
            elif not img_src.startswith(('http', '/')):
                self.log_issue('WARNING', essay_id, 'image', f'Image {i+1} has relative src: {img_src}')
                
            # Check alt text
            if not img_alt:
                self.log_issue('WARNING', essay_id, 'accessibility', f'Image {i+1} missing alt text')
            elif len(img_alt) < 5:
                self.log_issue('WARNING', essay_id, 'accessibility', f'Image {i+1} has very short alt text: "{img_alt}"')
                
        # Check figures
        figures = soup.find_all('figure')
        for i, figure in enumerate(figures):
            # Check for image inside figure
            fig_img = figure.find('img')
            if not fig_img:
                self.log_issue('WARNING', essay_id, 'figure', f'Figure {i+1} contains no image')
                
            # Check for figcaption
            figcaption = figure.find('figcaption')
            if not figcaption:
                self.log_issue('WARNING', essay_id, 'figure', f'Figure {i+1} missing caption')
            else:
                caption_text = figcaption.get_text(strip=True)
                if len(caption_text) < 10:
                    self.log_issue('WARNING', essay_id, 'figure', f'Figure {i+1} has very short caption')
                    
        return valid
        
    def validate_bibliography(self, soup: BeautifulSoup, essay_id: str) -> bool:
        """Validate bibliography section"""
        valid = True
        
        # Look for bibliography section
        bib_section = soup.find('div', class_='bibliography')
        if not bib_section:
            # Alternative search patterns
            bib_patterns = [
                soup.find(text=re.compile(r'bibliography', re.IGNORECASE)),
                soup.find(text=re.compile(r'references', re.IGNORECASE)),
                soup.find(text=re.compile(r'works cited', re.IGNORECASE))
            ]
            
            if not any(bib_patterns):
                self.log_issue('WARNING', essay_id, 'bibliography', 'No bibliography section found')
                return valid
                
        # If bibliography exists, check its structure
        if bib_section:
            bib_text = bib_section.get_text(strip=True)
            if len(bib_text) < 100:
                self.log_issue('WARNING', essay_id, 'bibliography', 'Bibliography section seems very short')
                
            # Check for citation patterns
            citations = re.findall(r'[A-Z][a-z]+,\s+[A-Z]', bib_text)
            if len(citations) < 3:
                self.log_issue('WARNING', essay_id, 'bibliography', 'Few citations detected in bibliography')
                
        return valid
        
    def validate_links(self, soup: BeautifulSoup, essay_id: str) -> bool:
        """Validate links and references"""
        valid = True
        
        links = soup.find_all('a')
        internal_links = 0
        external_links = 0
        broken_links = 0
        
        for link in links:
            href = link.get('href', '')
            link_text = link.get_text(strip=True)
            
            if not href:
                self.log_issue('WARNING', essay_id, 'links', 'Link with no href attribute')
                broken_links += 1
                continue
                
            if href.startswith('#'):
                # Internal fragment link
                internal_links += 1
            elif href.startswith(('http://', 'https://')):
                # External link
                external_links += 1
                
                # Check for suspicious patterns
                if 'drive.google.com' in href and 'open?id=' in href:
                    self.log_issue('INFO', essay_id, 'links', 'Contains Google Drive link')
                    
            elif href.startswith('/'):
                # Internal site link
                internal_links += 1
            else:
                # Potentially broken relative link
                self.log_issue('WARNING', essay_id, 'links', f'Potentially broken relative link: {href}')
                broken_links += 1
                
            # Check for empty link text
            if not link_text or link_text.strip() in ['', 'here', 'click here']:
                self.log_issue('WARNING', essay_id, 'accessibility', 'Link with poor or no text')
                
        return valid
        
    def validate_essay_structure(self, annotation: Dict) -> Dict:
        """Perform complete structure validation of an essay"""
        essay_id = annotation.get('id', 'unknown')
        
        # Parse HTML
        soup = self.parse_html(essay_id)
        if not soup:
            return {
                'essay_id': essay_id,
                'valid': False,
                'errors': ['Failed to parse HTML'],
                'warnings': [],
                'info': []
            }
            
        # Run all validations
        title_valid = self.validate_title_structure(soup, essay_id)
        content_valid = self.validate_content_structure(soup, essay_id)
        images_valid = self.validate_images_and_figures(soup, essay_id)
        bib_valid = self.validate_bibliography(soup, essay_id)
        links_valid = self.validate_links(soup, essay_id)
        
        # Collect issues for this essay
        essay_issues = [issue for issue in self.issues if issue['essay_id'] == essay_id]
        errors = [i for i in essay_issues if i['severity'] in ['CRITICAL', 'ERROR']]
        warnings = [i for i in essay_issues if i['severity'] == 'WARNING']
        info = [i for i in essay_issues if i['severity'] == 'INFO']
        
        overall_valid = all([title_valid, content_valid, images_valid, bib_valid, links_valid]) and len(errors) == 0
        
        return {
            'essay_id': essay_id,
            'valid': overall_valid,
            'title_valid': title_valid,
            'content_valid': content_valid,
            'images_valid': images_valid,
            'bibliography_valid': bib_valid,
            'links_valid': links_valid,
            'error_count': len(errors),
            'warning_count': len(warnings),
            'info_count': len(info)
        }
        
    def run_validation(self) -> Dict:
        """Run structure validation on all essays"""
        print("🏗️  Starting HTML structure validation...")
        
        annotations = self.load_annotations()
        if not annotations:
            return {'success': False, 'error': 'Could not load annotations'}
            
        self.stats['total_essays'] = len(annotations)
        print(f"📚 Validating structure for {len(annotations)} essays...")
        
        results = []
        
        for i, annotation in enumerate(annotations, 1):
            essay_id = annotation.get('id', f'unknown_{i}')
            print(f"  [{i:3d}/{len(annotations)}] Validating {essay_id}...")
            
            result = self.validate_essay_structure(annotation)
            results.append(result)
            
            # Update stats
            if result['valid']:
                self.stats['valid_structure'] += 1
            if not result['title_valid']:
                self.stats['missing_titles'] += 1
            if not result['content_valid']:
                self.stats['missing_content'] += 1
                
        return {
            'success': True,
            'stats': self.stats,
            'issues': self.issues,
            'results': results,
            'timestamp': datetime.now().isoformat()
        }
        
    def generate_report(self, validation_results: Dict) -> str:
        """Generate structure validation report"""
        if not validation_results['success']:
            return f"❌ Structure validation failed: {validation_results.get('error', 'Unknown error')}"
            
        stats = validation_results['stats']
        issues = validation_results['issues']
        results = validation_results['results']
        
        # Calculate percentages
        total = stats['total_essays']
        valid_pct = (stats['valid_structure'] / total * 100) if total > 0 else 0
        
        report = f"""
# HTML Structure Validation Report
**Generated:** {validation_results['timestamp']}

## 📊 Summary Statistics
- **Total Essays:** {stats['total_essays']}
- **Valid Structure:** {stats['valid_structure']} ({valid_pct:.1f}%)
- **Structure Issues:** {total - stats['valid_structure']}

## 🔍 Issue Breakdown
"""
        
        # Group issues by severity and type
        critical = [i for i in issues if i['severity'] == 'CRITICAL']
        errors = [i for i in issues if i['severity'] == 'ERROR']
        warnings = [i for i in issues if i['severity'] == 'WARNING']
        info = [i for i in issues if i['severity'] == 'INFO']
        
        report += f"""
- **Critical Issues:** {len(critical)}
- **Errors:** {len(errors)}
- **Warnings:** {len(warnings)}
- **Info Messages:** {len(info)}
"""
        
        # Most common issues
        if issues:
            issue_types = {}
            for issue in issues:
                element = issue['element']
                if element not in issue_types:
                    issue_types[element] = 0
                issue_types[element] += 1
                
            sorted_types = sorted(issue_types.items(), key=lambda x: x[1], reverse=True)
            
            report += f"\n## 📋 Most Common Issues\n"
            for element, count in sorted_types[:10]:
                report += f"- **{element}**: {count} issues\n"
                
        # Detailed issues
        if critical:
            report += f"\n## 🛑 Critical Issues ({len(critical)})\n"
            for issue in critical:
                report += f"- **{issue['essay_id']}** [{issue['element']}]: {issue['issue']}\n"
                
        if errors:
            report += f"\n## ❌ Errors ({len(errors)})\n"
            for issue in errors:
                report += f"- **{issue['essay_id']}** [{issue['element']}]: {issue['issue']}\n"
                
        if not issues:
            report += "\n✅ **No structure issues found!** All essays have valid HTML structure.\n"
            
        return report


def main():
    """Main entry point"""
    validator = StructureValidator()
    
    print("🦎 Making and Knowing Edition - HTML Structure Validator")
    print("=" * 60)
    
    # Run validation
    results = validator.run_validation()
    
    # Generate report
    report = validator.generate_report(results)
    
    # Save results
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    results_file = Path(__file__).parent / f"structure_results_{timestamp}.json"
    report_file = Path(__file__).parent / f"structure_report_{timestamp}.md"
    
    with open(results_file, 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
        
    with open(report_file, 'w', encoding='utf-8') as f:
        f.write(report)
        
    print("\n" + "=" * 60)
    print("🏗️  STRUCTURE VALIDATION COMPLETE")
    print("=" * 60)
    print(report)
    print(f"\n💾 Results saved to: {results_file}")
    print(f"📄 Report saved to: {report_file}")
    
    # Exit with appropriate code
    if results['success'] and len([i for i in validator.issues if i['severity'] in ['CRITICAL', 'ERROR']]) == 0:
        print("\n✅ All essays have valid structure!")
        sys.exit(0)
    else:
        critical_errors = len([i for i in validator.issues if i['severity'] in ['CRITICAL', 'ERROR']])
        print(f"\n⚠️ Found {critical_errors} critical structure issues")
        sys.exit(1)


if __name__ == "__main__":
    main()