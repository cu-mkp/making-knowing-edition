#!/usr/bin/env python3
"""
Master Test Runner for Making and Knowing Edition

This script runs all available testing scripts and generates a combined report.
"""

import subprocess
import sys
from pathlib import Path
from datetime import datetime
import json


def run_script(script_name: str, script_path: Path) -> dict:
    """Run a testing script and capture results"""
    print(f"\n🚀 Running {script_name}...")
    print("=" * 50)
    
    try:
        # Run the script
        result = subprocess.run(
            [sys.executable, str(script_path)],
            capture_output=True,
            text=True,
            cwd=script_path.parent
        )
        
        return {
            'script': script_name,
            'success': result.returncode == 0,
            'returncode': result.returncode,
            'stdout': result.stdout,
            'stderr': result.stderr,
            'duration': 'completed'
        }
        
    except Exception as e:
        return {
            'script': script_name,
            'success': False,
            'returncode': -1,
            'stdout': '',
            'stderr': str(e),
            'duration': 'failed'
        }


def main():
    """Run all testing scripts"""
    print("🦎 Making and Knowing Edition - Master Test Runner")
    print("=" * 60)
    print(f"⏰ Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Define test scripts
    test_dir = Path(__file__).parent
    scripts = [
        ('Essay Audit', test_dir / 'audit-essays.py'),
        ('Thumbnail Check', test_dir / 'check-thumbnails.py'),
        ('Structure Validation', test_dir / 'validate-structure.py')
    ]
    
    # Run all scripts
    results = []
    for script_name, script_path in scripts:
        if script_path.exists():
            result = run_script(script_name, script_path)
            results.append(result)
            
            # Print summary
            status = "✅ PASSED" if result['success'] else "❌ FAILED"
            print(f"\n{status} - {script_name}")
        else:
            print(f"⚠️ Script not found: {script_path}")
            results.append({
                'script': script_name,
                'success': False,
                'returncode': -1,
                'stdout': '',
                'stderr': f'Script not found: {script_path}',
                'duration': 'not_found'
            })
    
    # Generate combined report
    print("\n" + "=" * 60)
    print("📋 COMBINED TEST RESULTS")
    print("=" * 60)
    
    passed = sum(1 for r in results if r['success'])
    failed = len(results) - passed
    
    print(f"🎯 Summary: {passed} passed, {failed} failed out of {len(results)} tests")
    
    for result in results:
        status = "✅" if result['success'] else "❌"
        print(f"{status} {result['script']}")
        
        if not result['success'] and result['stderr']:
            print(f"   Error: {result['stderr'][:100]}...")
    
    # Save combined results
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    combined_results = {
        'timestamp': datetime.now().isoformat(),
        'summary': {
            'total_tests': len(results),
            'passed': passed,
            'failed': failed,
            'success_rate': (passed / len(results) * 100) if results else 0
        },
        'results': results
    }
    
    results_file = test_dir / f"combined_test_results_{timestamp}.json"
    with open(results_file, 'w', encoding='utf-8') as f:
        json.dump(combined_results, f, indent=2, ensure_ascii=False)
    
    print(f"\n💾 Combined results saved to: {results_file}")
    
    # Generate summary report
    report = f"""
# Combined Test Report
**Generated:** {combined_results['timestamp']}

## Summary
- **Total Tests:** {combined_results['summary']['total_tests']}
- **Passed:** {combined_results['summary']['passed']} ✅
- **Failed:** {combined_results['summary']['failed']} ❌
- **Success Rate:** {combined_results['summary']['success_rate']:.1f}%

## Individual Test Results
"""
    
    for result in results:
        status = "✅ PASSED" if result['success'] else "❌ FAILED"
        report += f"\n### {result['script']} - {status}\n"
        
        if result['success']:
            report += "No issues detected.\n"
        else:
            report += f"**Error:** {result['stderr'][:200]}...\n"
    
    report_file = test_dir / f"combined_test_report_{timestamp}.md"
    with open(report_file, 'w', encoding='utf-8') as f:
        f.write(report)
    
    print(f"📄 Combined report saved to: {report_file}")
    
    # Exit with appropriate code
    if all(r['success'] for r in results):
        print("\n🎉 All tests passed!")
        sys.exit(0)
    else:
        print(f"\n⚠️ {failed} test(s) failed")
        sys.exit(1)


if __name__ == "__main__":
    main()