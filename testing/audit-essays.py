#!/usr/bin/env python3
"""
Essay Audit Script for Making and Knowing Edition

This script performs a comprehensive audit of all essays in the collection,
checking for file integrity, metadata completeness, and content validation.
"""

import json
import os
import sys
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Tuple, Optional
import requests
from bs4 import BeautifulSoup

# Configuration
BASE_DIR = Path(__file__).parent.parent
ANNOTATIONS_DIR = BASE_DIR / "public" / "bnf-ms-fr-640" / "staging061825-0" / "annotations"
THUMBNAILS_DIR = BASE_DIR / "public" / "bnf-ms-fr-640" / "staging061825-0" / "annotations-thumbnails"
IMAGES_DIR = BASE_DIR / "public" / "bnf-ms-fr-640" / "staging061825-0" / "images"


class EssayAuditor:
    def __init__(self):
        self.issues = []
        self.stats = {
            'total_essays': 0,
            'complete_essays': 0,
            'missing_files': 0,
            'missing_abstracts': 0,
            'missing_thumbnails': 0,
            'broken_images': 0,
            'small_files': 0
        }
        
    def log_issue(self, severity: str, essay_id: str, issue: str):
        """Log an issue found during audit"""
        self.issues.append({
            'severity': severity,
            'essay_id': essay_id,
            'issue': issue,
            'timestamp': datetime.now().isoformat()
        })
        
    def load_annotations_manifest(self) -> Optional[Dict]:
        """Load the annotations.json manifest"""
        manifest_path = ANNOTATIONS_DIR / "annotations.json"
        if not manifest_path.exists():
            self.log_issue('CRITICAL', 'system', f"Annotations manifest not found: {manifest_path}")
            return None
            
        try:
            with open(manifest_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            self.log_issue('CRITICAL', 'system', f"Failed to load annotations manifest: {e}")
            return None
            
    def check_html_file(self, essay_id: str) -> Tuple[bool, int, Dict]:
        """Check if HTML file exists and analyze its content"""
        html_path = ANNOTATIONS_DIR / f"{essay_id}.html"
        
        if not html_path.exists():
            self.log_issue('CRITICAL', essay_id, "HTML file missing")
            return False, 0, {}
            
        try:
            file_size = html_path.stat().st_size
            
            # Read and parse HTML
            with open(html_path, 'r', encoding='utf-8') as f:
                content = f.read()
                
            soup = BeautifulSoup(content, 'html.parser')
            
            # Analyze HTML structure
            analysis = {
                'has_title': bool(soup.find(['h1', 'h2'])),
                'has_paragraphs': bool(soup.find('p')),
                'image_count': len(soup.find_all('img')),
                'figure_count': len(soup.find_all('figure')),
                'has_bibliography': 'bibliography' in content.lower(),
                'word_count': len(content.split()),
                'file_size': file_size
            }
            
            # Check for issues
            if file_size < 10000:  # Less than 10KB
                self.log_issue('WARNING', essay_id, f"Small file size: {file_size} bytes")
                
            if not analysis['has_title']:
                self.log_issue('ERROR', essay_id, "No title found in HTML")
                
            if analysis['word_count'] < 100:
                self.log_issue('WARNING', essay_id, f"Low word count: {analysis['word_count']}")
                
            return True, file_size, analysis
            
        except Exception as e:
            self.log_issue('ERROR', essay_id, f"Error reading HTML file: {e}")
            return False, 0, {}
            
    def check_thumbnail(self, annotation: Dict) -> bool:
        """Check if thumbnail exists and is accessible"""
        essay_id = annotation.get('id', 'unknown')
        
        # Check local thumbnail
        if 'thumbnail' in annotation:
            local_path = THUMBNAILS_DIR / annotation['thumbnail']
            if local_path.exists():
                return True
            else:
                self.log_issue('ERROR', essay_id, f"Local thumbnail missing: {annotation['thumbnail']}")
                return False
                
        # Check S3 thumbnail
        if 's3ThumbUrl' in annotation:
            try:
                response = requests.head(annotation['s3ThumbUrl'], timeout=10)
                if response.status_code == 200:
                    return True
                else:
                    self.log_issue('ERROR', essay_id, f"S3 thumbnail not accessible: {response.status_code}")
                    return False
            except Exception as e:
                self.log_issue('ERROR', essay_id, f"Error checking S3 thumbnail: {e}")
                return False
                
        self.log_issue('WARNING', essay_id, "No thumbnail configuration found")
        return False
        
    def check_images(self, essay_id: str, html_analysis: Dict) -> int:
        """Check if essay images exist"""
        image_dir = IMAGES_DIR / essay_id
        broken_images = 0
        
        if html_analysis['image_count'] > 0:
            if not image_dir.exists():
                self.log_issue('ERROR', essay_id, "Image directory missing but HTML contains images")
                return html_analysis['image_count']
                
            # Count actual image files
            image_files = list(image_dir.glob('*.[jp][pn]g')) + list(image_dir.glob('*.jpeg'))
            actual_count = len(image_files)
            expected_count = html_analysis['image_count']
            
            if actual_count < expected_count:
                missing = expected_count - actual_count
                self.log_issue('WARNING', essay_id, f"Missing {missing} image files")
                broken_images = missing
                
        return broken_images
        
    def audit_single_essay(self, annotation: Dict) -> Dict:
        """Perform complete audit of a single essay"""
        essay_id = annotation.get('id', 'unknown')
        
        # Check required fields
        required_fields = ['id', 'fullTitle', 'abstract', 'contentURL']
        for field in required_fields:
            if not annotation.get(field):
                self.log_issue('ERROR', essay_id, f"Missing required field: {field}")
                
        # Check HTML file
        html_exists, file_size, html_analysis = self.check_html_file(essay_id)
        
        # Check thumbnail
        thumbnail_ok = self.check_thumbnail(annotation)
        
        # Check images
        broken_images = 0
        if html_exists:
            broken_images = self.check_images(essay_id, html_analysis)
            
        # Determine if essay is complete
        is_complete = (
            html_exists and 
            annotation.get('abstract') and 
            thumbnail_ok and 
            broken_images == 0
        )
        
        return {
            'essay_id': essay_id,
            'is_complete': is_complete,
            'html_exists': html_exists,
            'file_size': file_size,
            'thumbnail_ok': thumbnail_ok,
            'broken_images': broken_images,
            'html_analysis': html_analysis
        }
        
    def run_audit(self) -> Dict:
        """Run complete audit of all essays"""
        print("🔍 Starting comprehensive essay audit...")
        
        # Load manifest
        manifest = self.load_annotations_manifest()
        if not manifest:
            return {'success': False, 'error': 'Could not load annotations manifest'}
            
        essays = manifest.get('content', [])
        self.stats['total_essays'] = len(essays)
        
        print(f"📚 Found {len(essays)} essays to audit")
        
        # Audit each essay
        results = []
        for i, annotation in enumerate(essays, 1):
            essay_id = annotation.get('id', f'unknown_{i}')
            print(f"  [{i:3d}/{len(essays)}] Auditing {essay_id}...")
            
            result = self.audit_single_essay(annotation)
            results.append(result)
            
            # Update stats
            if result['is_complete']:
                self.stats['complete_essays'] += 1
            if not result['html_exists']:
                self.stats['missing_files'] += 1
            if not annotation.get('abstract'):
                self.stats['missing_abstracts'] += 1
            if not result['thumbnail_ok']:
                self.stats['missing_thumbnails'] += 1
            if result['broken_images'] > 0:
                self.stats['broken_images'] += result['broken_images']
            if result['file_size'] < 10000:
                self.stats['small_files'] += 1
                
        return {
            'success': True,
            'stats': self.stats,
            'issues': self.issues,
            'results': results,
            'timestamp': datetime.now().isoformat()
        }
        
    def generate_report(self, audit_results: Dict) -> str:
        """Generate human-readable audit report"""
        if not audit_results['success']:
            return f"❌ Audit failed: {audit_results.get('error', 'Unknown error')}"
            
        stats = audit_results['stats']
        issues = audit_results['issues']
        
        # Calculate percentages
        total = stats['total_essays']
        complete_pct = (stats['complete_essays'] / total * 100) if total > 0 else 0
        
        report = f"""
# Essay Audit Report
**Generated:** {audit_results['timestamp']}

## 📊 Summary Statistics
- **Total Essays:** {stats['total_essays']}
- **Complete Essays:** {stats['complete_essays']} ({complete_pct:.1f}%)
- **Missing HTML Files:** {stats['missing_files']}
- **Missing Abstracts:** {stats['missing_abstracts']}
- **Missing Thumbnails:** {stats['missing_thumbnails']}
- **Broken Images:** {stats['broken_images']}
- **Small Files (<10KB):** {stats['small_files']}

## 🚨 Issues Found ({len(issues)} total)
"""
        
        # Group issues by severity
        critical = [i for i in issues if i['severity'] == 'CRITICAL']
        errors = [i for i in issues if i['severity'] == 'ERROR']
        warnings = [i for i in issues if i['severity'] == 'WARNING']
        
        if critical:
            report += f"\n### 🛑 Critical Issues ({len(critical)})\n"
            for issue in critical:
                report += f"- **{issue['essay_id']}**: {issue['issue']}\n"
                
        if errors:
            report += f"\n### ❌ Errors ({len(errors)})\n"
            for issue in errors:
                report += f"- **{issue['essay_id']}**: {issue['issue']}\n"
                
        if warnings:
            report += f"\n### ⚠️ Warnings ({len(warnings)})\n"
            for issue in warnings:
                report += f"- **{issue['essay_id']}**: {issue['issue']}\n"
                
        if not issues:
            report += "\n✅ **No issues found!** All essays passed validation.\n"
            
        return report


def main():
    """Main entry point"""
    auditor = EssayAuditor()
    
    print("🦎 Making and Knowing Edition - Essay Auditor")
    print("=" * 50)
    
    # Run audit
    results = auditor.run_audit()
    
    # Generate and save report
    report = auditor.generate_report(results)
    
    # Save detailed results
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    results_file = Path(__file__).parent / f"audit_results_{timestamp}.json"
    report_file = Path(__file__).parent / f"audit_report_{timestamp}.md"
    
    with open(results_file, 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
        
    with open(report_file, 'w', encoding='utf-8') as f:
        f.write(report)
        
    print("\n" + "=" * 50)
    print("📋 AUDIT COMPLETE")
    print("=" * 50)
    print(report)
    print(f"\n💾 Detailed results saved to: {results_file}")
    print(f"📄 Report saved to: {report_file}")
    
    # Exit with appropriate code
    if results['success'] and len(auditor.issues) == 0:
        print("\n✅ All tests passed!")
        sys.exit(0)
    else:
        print(f"\n⚠️ Found {len(auditor.issues)} issues")
        sys.exit(1)


if __name__ == "__main__":
    main()